"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = controller;
require("reflect-metadata");
const AppRouter_1 = require("../AppRouter");
const MetadataKeys_1 = require("./MetadataKeys");
function bodyValidators(keys) {
    return (req, res, next) => {
        if (!req.body || !req.params) {
            res.status(422).send('Invalid request');
            return;
        }
        for (const key of keys) {
            if (!req.body.hasOwnProperty(key)) {
                res.status(422).send(`Missing property: ${key}`);
                return;
            }
        }
        next();
    };
}
function controller(routePrefix) {
    return function (target) {
        const router = AppRouter_1.AppRouter.getInstance();
        // Use Object.getOwnPropertyNames for ES2015 compatibility
        for (const key of Object.getOwnPropertyNames(target.prototype)) {
            const routeHandler = target.prototype[key];
            const path = Reflect.getMetadata(MetadataKeys_1.MetadataKeys.path, target.prototype, key);
            const method = Reflect.getMetadata(MetadataKeys_1.MetadataKeys.method, target.prototype, key);
            const middlewares = Reflect.getMetadata(MetadataKeys_1.MetadataKeys.middleware, target.prototype, key) ||
                [];
            const requiredBodyProps = Reflect.getMetadata(MetadataKeys_1.MetadataKeys.validator, target.prototype, key) ||
                [];
            const validator = bodyValidators(requiredBodyProps);
            if (path && method) {
                router[method](`${routePrefix}${path}`, ...middlewares, validator, routeHandler);
                console.log(`Registered route: [${method.toUpperCase()}] ${routePrefix}${path}`);
            }
        }
    };
}
