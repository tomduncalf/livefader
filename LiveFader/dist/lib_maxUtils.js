"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.Log = exports.log = void 0;
var log = function (x, y, z) {
    for (var i = 0, len = arguments.length; i < len; i++) {
        var message = arguments[i];
        var outMessage;
        if (message && message.toString) {
            var s = message.toString();
            if (s.indexOf("[object ") >= 0) {
                s = JSON.stringify(message);
            }
            outMessage = s;
        }
        else if (message === null) {
            outMessage = "<null>";
        }
        else {
            outMessage = message;
        }
        post(outMessage);
        outlet(0, "prepend", outMessage + "\n");
    }
    post("\n");
};
exports.log = log;
var ENABLED_LOG_MODULES = ["LiveParameterListener"];
var Log = /** @class */ (function () {
    function Log(moduleName) {
        var _this = this;
        this.moduleName = moduleName;
        this.logIfEnabled = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (ENABLED_LOG_MODULES.length === 0 ||
                ENABLED_LOG_MODULES.indexOf(_this.moduleName) > -1)
                exports.log(args);
        };
        this.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.logIfEnabled.apply(_this, __spreadArray([_this.moduleName, "debug"], args));
        };
        this.verbose = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.logIfEnabled.apply(_this, __spreadArray([_this.moduleName, "verbose"], args));
        };
        this.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return exports.log.apply(void 0, __spreadArray([_this.moduleName, "error"], args));
        };
    }
    return Log;
}());
exports.Log = Log;
