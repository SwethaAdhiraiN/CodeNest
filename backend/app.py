import os
import json
import uuid
import hashlib
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory, session, abort
from flask_cors import CORS

# Configure paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
SNIPPETS_FILE = os.path.join(DATA_DIR, 'snippets.json')
AUDIT_FILE = os.path.join(DATA_DIR, 'audit.json')
COMMENTS_FILE = os.path.join(DATA_DIR, 'comments.json')
SESSIONS_FILE = os.path.join(DATA_DIR, 'sessions.json')

os.makedirs(DATA_DIR, exist_ok=True)

# Application and config
app = Flask(__name__, static_url_path='', static_folder='../frontend/dist')
app.secret_key = os.environ.get("CODENEST_SECRET_KEY", "dev_secret_key")
app.permanent_session_lifetime = timedelta(days=3)
CORS(app)

############ Util functions ############

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def load_json(file_path, default=None):
    if not os.path.exists(file_path):
        return default if default is not None else []
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json(file_path, obj):
    with open(file_path, 'w') as f:
        json.dump(obj, f, indent=2)

def get_new_id():
    return str(uuid.uuid4())

def log_audit(action, username=None, detail=None):
    log = load_json(AUDIT_FILE, [])
    log.append({
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "username": username if username else session.get("username"),
        "action": action,
        "detail": detail,
    })
    save_json(AUDIT_FILE, log)

def get_current_user():
    return session.get("username"), session.get('role')

def require_auth(roles=None):
    # PUBLIC_INTERFACE
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user, role = get_current_user()
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            if roles and role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

def snippet_versioned_save(snippet):
    snippets = load_json(SNIPPETS_FILE, [])
    # support versioning
    found = next((s for s in snippets if s['id']==snippet['id']), None)
    if found:
        if "versions" not in found:
            found["versions"] = []
        last = dict(found)
        last.pop("versions", None)
        found['versions'].append(last)
        found.update(snippet)
    else:
        snippet["versions"] = []
        snippets.append(snippet)
    save_json(SNIPPETS_FILE, snippets)

############# Auth & User Management APIs #############

@app.route("/api/auth/register", methods=['POST'])
def register():
    """Register a new user"""
    data = request.json or {}
    username = data.get('username', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', '').lower()
    if not username or not password or role not in ["admin", "contributor", "viewer"]:
        return jsonify({"error": "Invalid registration data"}), 400
    users = load_json(USERS_FILE, [])
    if any(u['username'] == username for u in users):
        return jsonify({"error": "Username exists"}), 400
    user = {
        "id": get_new_id(),
        "username": username,
        "password": hash_password(password),
        "role": role,
        "created_at": datetime.utcnow().isoformat() + 'Z',
    }
    users.append(user)
    save_json(USERS_FILE, users)
    log_audit("register", username=username)
    return jsonify({"message": "Registered successfully"}), 201

@app.route("/api/auth/login", methods=['POST'])
def login():
    """User login"""
    data = request.json or {}
    username = data.get('username', '').strip().lower()
    password = hash_password(data.get('password', ''))
    users = load_json(USERS_FILE, [])
    user = next((u for u in users if u['username'] == username and u['password'] == password), None)
    if not user:
        log_audit("failed_login", username=username)
        return jsonify({"error": "Invalid credentials"}), 401
    session['username'] = user['username']
    session['role'] = user['role']
    session.permanent = True
    log_audit("login", username=username)
    return jsonify({"username": username, "role": user['role']}), 200

@app.route("/api/auth/logout", methods=['POST'])
@require_auth()
def logout():
    username = session.get('username', None)
    session.clear()
    log_audit("logout", username=username)
    return jsonify({"message": "Logged out"}), 200

@app.route("/api/auth/me", methods=['GET'])
@require_auth()
def me():
    """Get current user info"""
    user, role = get_current_user()
    return jsonify({"username": user, "role": role}), 200

############# Code Snippet CRUD & Versioning #############

@app.route('/api/snippets', methods=['POST'])
@require_auth(roles=['admin', 'contributor'])
def submit_snippet():
    """Submit a new code snippet"""
    data = request.json or {}
    if not data.get("title") or not data.get("code"):
        return jsonify({"error": "Missing snippet content"}), 400
    snippet = {
        "id": get_new_id(),
        "title": data["title"],
        "description": data.get("description", ""),
        "code": data["code"],
        "tags": data.get("tags", []),
        "language": data.get("language", "unspecified"),
        "author": session.get('username'),
        "created_at": datetime.utcnow().isoformat() + 'Z',
        "updated_at": datetime.utcnow().isoformat() + 'Z',
        "upvotes": 0,
        "comments": [],
        "history": [],
        "downloads": 0,
        "versions": []
    }
    snippets = load_json(SNIPPETS_FILE, [])
    snippets.append(snippet)
    save_json(SNIPPETS_FILE, snippets)
    log_audit("snippet_created", username=session.get('username'), detail=snippet["id"])
    return jsonify(snippet), 201

@app.route('/api/snippets', methods=['GET'])
@require_auth()
def get_snippets():
    """Get all code snippets or search"""
    tag = request.args.get('tag')
    q = request.args.get('q')
    language = request.args.get('language')
    snippets = load_json(SNIPPETS_FILE, [])
    results = snippets
    if tag:
        results = [s for s in results if tag in s.get("tags",[])]
    if language:
        results = [s for s in results if language.lower() == s.get("language","").lower()]
    if q:
        ql = q.lower()
        def matches(snippet):
            return (
                ql in snippet.get("title","").lower() or
                ql in snippet.get("description","").lower() or
                ql in snippet.get("code","").lower() or
                any(ql in t.lower() for t in snippet.get("tags",[]))
            )
        results = [s for s in results if matches(s)]
    # Optionally, add pagination
    return jsonify(results), 200

@app.route('/api/snippets/<sid>', methods=['GET'])
@require_auth()
def get_snippet(sid):
    """Get a single code snippet"""
    snippets = load_json(SNIPPETS_FILE, [])
    snippet = next((s for s in snippets if s['id']==sid), None)
    if not snippet:
        return jsonify({"error": "Not found"}), 404
    return jsonify(snippet), 200

@app.route('/api/snippets/<sid>', methods=['PUT'])
@require_auth(roles=['admin', 'contributor'])
def edit_snippet(sid):
    """Edit a code snippet (role-determined)"""
    data = request.json or {}
    snippets = load_json(SNIPPETS_FILE, [])
    idx = next((i for i,s in enumerate(snippets) if s['id']==sid), None)
    if idx is None:
        return jsonify({"error": "Not found"}), 404
    snippet = snippets[idx]
    # Versioning: copy old to versions (partial)
    v = dict(snippet)
    v.pop("versions", None)
    snippet.setdefault("versions", []).append(v)
    snippet["title"] = data.get("title", snippet["title"])
    snippet["description"] = data.get("description", snippet["description"])
    snippet["code"] = data.get("code", snippet["code"])
    snippet["tags"] = data.get("tags", snippet.get("tags", []))
    snippet["language"] = data.get("language", snippet.get("language",""))
    snippet["updated_at"] = datetime.utcnow().isoformat() + "Z"
    snippets[idx] = snippet
    save_json(SNIPPETS_FILE, snippets)
    log_audit("snippet_edited", detail=sid)
    return jsonify(snippet), 200

@app.route('/api/snippets/<sid>', methods=['DELETE'])
@require_auth(roles=['admin', 'contributor'])
def delete_snippet(sid):
    """Delete a code snippet"""
    snippets = load_json(SNIPPETS_FILE, [])
    idx = next((i for i,s in enumerate(snippets) if s['id']==sid), None)
    if idx is None:
        return jsonify({"error": "Not found"}), 404
    snippet = snippets.pop(idx)
    save_json(SNIPPETS_FILE, snippets)
    log_audit("snippet_deleted", detail=sid)
    return jsonify({"message": "Deleted"}), 200

@app.route('/api/snippets/<sid>/upvote', methods=['POST'])
@require_auth()
def upvote_snippet(sid):
    snippets = load_json(SNIPPETS_FILE, [])
    snippet = next((s for s in snippets if s['id']==sid), None)
    if not snippet:
        return jsonify({"error": "Not found"}), 404
    snippet["upvotes"] = snippet.get("upvotes", 0) + 1
    save_json(SNIPPETS_FILE, snippets)
    log_audit("snippet_upvoted", detail=sid)
    return jsonify({"message": "Upvoted"}), 200

@app.route('/api/snippets/<sid>/download', methods=['POST'])
@require_auth()
def download_snippet(sid):
    snippets = load_json(SNIPPETS_FILE, [])
    snippet = next((s for s in snippets if s['id']==sid), None)
    if not snippet:
        return jsonify({"error": "Not found"}), 404
    snippet["downloads"] = snippet.get("downloads", 0) + 1
    save_json(SNIPPETS_FILE, snippets)
    log_audit("snippet_downloaded", detail=sid)
    return jsonify({"code": snippet["code"]}), 200

############## Comment APIs ##############

@app.route('/api/snippets/<sid>/comments', methods=['POST'])
@require_auth()
def post_comment(sid):
    data = request.json or {}
    text = data.get("text","").strip()
    if not text:
        return jsonify({"error": "Comment empty"}), 400
    snippets = load_json(SNIPPETS_FILE, [])
    snippet = next((s for s in snippets if s['id']==sid), None)
    if not snippet:
        return jsonify({"error": "Not found"}), 404
    comment = {
        "id": get_new_id(),
        "author": session.get("username"),
        "text": text,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    snippet.setdefault("comments", []).append(comment)
    save_json(SNIPPETS_FILE, snippets)
    log_audit("comment_added", detail=sid)
    return jsonify(comment), 201

@app.route('/api/snippets/<sid>/comments', methods=['GET'])
@require_auth()
def get_comments(sid):
    snippets = load_json(SNIPPETS_FILE, [])
    snippet = next((s for s in snippets if s['id']==sid), None)
    if not snippet:
        return jsonify({"error": "Not found"}), 404
    return jsonify(snippet.get("comments", [])), 200

############## Activity Feed & Audit ##############

@app.route('/api/audit', methods=["GET"])
@require_auth(roles=["admin"])
def get_audit():
    """Get the system audit log (admin)"""
    log = load_json(AUDIT_FILE, [])
    return jsonify(log), 200

@app.route('/api/feed', methods=["GET"])
@require_auth()
def activity_feed():
    """Return recent activity (snippets, upvotes, comments)"""
    snippets = load_json(SNIPPETS_FILE, [])
    events = []
    for s in snippets:
        e = {
            "id": s["id"],
            "type": "snippet",
            "title": s["title"],
            "author": s["author"],
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
            "upvotes": s.get("upvotes", 0),
            "downloads": s.get("downloads", 0)
        }
        events.append(e)
        for c in s.get("comments", []):
            events.append({
                "id": c["id"],
                "type": "comment",
                "snippet_id": s["id"],
                "text": c["text"],
                "author": c["author"],
                "created_at": c["created_at"]
            })
    return jsonify(sorted(events, key=lambda x: x.get("created_at", ""), reverse=True)[:100]), 200

############## Static file handling (deploy frontend) ##############

@app.route('/', defaults={'u_path': ''})
@app.route('/<path:u_path>')
def serve_frontend(u_path):
    """Serve frontend"""
    if u_path and os.path.exists(os.path.join(app.static_folder, u_path)):
        return send_from_directory(app.static_folder, u_path)
    else:
        return send_from_directory(app.static_folder, "index.html")

############## Main ##############

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
