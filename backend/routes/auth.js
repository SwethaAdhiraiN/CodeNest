const express = require('express');
const router = express.Router();
const {
    findUserByUsername,
    createUser,
    verifyPassword,
    generateJWT,
    getAllUsers
} = require('../auth');
const { requireAuth, requireRole } = require('../users');

// PUBLIC_INTERFACE
router.post('/register', (req, res) => {
    /** Register a new user (role: contributor or viewer only) */
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['contributor', 'viewer'].includes(role)) {
        return res.status(400).json({ error: 'Role must be contributor or viewer' });
    }
    try {
        const user = createUser({ username, password, role });
        res.status(201).json({ user: { username: user.username, role: user.role } });
    } catch (err) {
        res.status(409).json({ error: err.message });
    }
});

// PUBLIC_INTERFACE
router.post('/login', (req, res) => {
    /** User login: returns JWT token */
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }
    const user = findUserByUsername(username);
    if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = generateJWT(user);
    res.json({ token, user: { username: user.username, role: user.role } });
});

// PUBLIC_INTERFACE
router.get('/me', requireAuth, (req, res) => {
    /** Get info about current logged-in user */
    res.json({ user: req.user });
});

// PUBLIC_INTERFACE
router.get('/users', requireAuth, requireRole('admin'), (req, res) => {
    /** List all users (admin only) */
    res.json({ users: getAllUsers() });
});

module.exports = router;
