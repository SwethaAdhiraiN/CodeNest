const { verifyJWT } = require('./auth');

// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
    /** Express middleware: require JWT authentication */
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const payload = verifyJWT(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = payload;
    next();
}

// PUBLIC_INTERFACE
function requireRole(role) {
    /** Express middleware: restrict endpoint to specified role (or higher) */
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const accessHierarchy = {
            admin: 3,
            contributor: 2,
            viewer: 1
        };
        if (
            !Object.hasOwn(accessHierarchy, req.user.role) ||
            accessHierarchy[req.user.role] < accessHierarchy[role]
        ) {
            return res.status(403).json({ error: 'Insufficient privileges' });
        }
        next();
    };
}

module.exports = {
    requireAuth,
    requireRole
};
