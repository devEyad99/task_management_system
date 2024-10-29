"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utiles/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        res
            .status(401)
            .json({ message: 'You are not logged in! Please log in to get access.' });
        return;
    }
    try {
        const currentUser = (0, jwt_1.verifyAccessToken)(token);
        req.currentUser = currentUser;
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid token. Please log in again.' });
        return;
    }
};
exports.authenticate = authenticate;
