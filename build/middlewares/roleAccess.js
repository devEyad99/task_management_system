"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerAndAdminRole = exports.adminRole = void 0;
const adminRole = (req, res, next) => {
    var _a;
    const role = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.role;
    if (role !== 'admin') {
        res.status(403).json({
            extra: 'admin role',
            message: 'You are not authorized to access this route',
        });
        return;
    }
    next();
};
exports.adminRole = adminRole;
const managerAndAdminRole = (req, res, next) => {
    var _a;
    const role = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.role;
    if (role !== 'manager' && role !== 'admin') {
        res.status(403).json({
            extra: 'manager role',
            message: 'You are not authorized to access this route',
        });
        return;
    }
    next();
};
exports.managerAndAdminRole = managerAndAdminRole;
