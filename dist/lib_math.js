"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerp = void 0;
var lerp = function (v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
};
exports.lerp = lerp;
