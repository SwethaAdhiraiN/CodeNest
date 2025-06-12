const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_this_in_prod';

// PRIVATE: Read users from JSON
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    const content = fs.readFileSync(USERS_FILE, 'utf8');
    try {
        return JSON.parse(content);
    } catch {
        return [];
    }
}

// PRIVATE: Write users to JSON
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// PUBLIC_INTERFACE
function hashPassword(password) {
    /** Securely hash a plain-text password */
    const saltRounds = 12;
    return bcrypt.hashSync(password, saltRounds);
}

// PUBLIC_INTERFACE
function verifyPassword(password, hash) {
    /** Synchronously verify plain-text password matches stored hash */
    return bcrypt.compareSync(password, hash);
}

// PUBLIC_INTERFACE
function findUserByUsername(username) {
    /** Look up a user object by username */
    const users = readUsers();
    return users.find(u => u.username === username);
}

// PUBLIC_INTERFACE
function createUser({ username, password, role }) {
    /** Create a new user with hashed password and role */
    const users = readUsers();
    if (users.find(u => u.username === username)) {
        throw new Error('Username already exists');
    }
    const hashed = hashPassword(password);
    const user = {
        username,
        password: hashed,
        role,
        created_at: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);
    return { ...user, password: undefined };
}

// PUBLIC_INTERFACE
function generateJWT(user) {
    /** Generate JWT for valid user login */
    const token = jwt.sign(
        {
            username: user.username,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '2h' }
    );
    return token;
}

// PUBLIC_INTERFACE
function verifyJWT(token) {
    /** Verify JWT token and return decoded payload or null */
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// PUBLIC_INTERFACE
function getAllUsers() {
    /** Get all users (w/o password hashes) */
    const users = readUsers();
    return users.map(({ password, ...rest }) => rest);
}


// PUBLIC_INTERFACE
function seedAdmin() {
    /** Seed an initial admin user if none exists */
    const users = readUsers();
    if (!users.some(u => u.role === 'admin')) {
        createUser({
            username: 'admin',
            password: 'Admin@12345', // CHANGE this after first login
            role: 'admin',
        });
        return true;
    }
    return false;
}

module.exports = {
    hashPassword,
    verifyPassword,
    findUserByUsername,
    createUser,
    generateJWT,
    verifyJWT,
    getAllUsers,
    seedAdmin
};
