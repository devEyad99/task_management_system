"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.use = use;
require("reflect-metadata");
const MetadataKeys_1 = require("./MetadataKeys");
function use(middleware) {
    return function (target, key, desc) {
        const middlewares = Reflect.getMetadata(MetadataKeys_1.MetadataKeys.middleware, target.constructor.prototype, key) || [];
        middlewares.push(middleware);
        Reflect.defineMetadata(MetadataKeys_1.MetadataKeys.middleware, middlewares, target.constructor.prototype, key);
    };
}
