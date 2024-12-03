"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyValidator = bodyValidator;
require("reflect-metadata");
const MetadataKeys_1 = require("./MetadataKeys");
function bodyValidator(...keys) {
    return function (target, key, desc) {
        Reflect.defineMetadata(MetadataKeys_1.MetadataKeys.validator, keys, target.constructor.prototype, key);
    };
}
