"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.LogLevels = exports.log = void 0;
var config_log_1 = require("./config_log");
var outletLog = [];
// Based on https://cycling74.com/forums/tutorial-using-the-javascript-live-api-in-max-for-live/replies/1#reply-5fd76050b2a7ee5f9fbcfb78
function log(x, y, z) {
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
        if (config_log_1.LOG_TO_OUTLET) {
            outletLog = __spreadArray([outMessage], outletLog);
            outletLog = outletLog.slice(0, config_log_1.OUTLET_LOG_LINES);
            outlet(0, "set", outletLog.join("\n"));
        }
    }
    post("\n");
}
exports.log = log;
var LogLevels;
(function (LogLevels) {
    LogLevels["Debug"] = "debug";
    LogLevels["Verbose"] = "verbose";
})(LogLevels = exports.LogLevels || (exports.LogLevels = {}));
var Log = /** @class */ (function () {
    function Log(moduleName) {
        var _this = this;
        this.moduleName = moduleName;
        this.logIfEnabled = function (level) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (config_log_1.LOG_ALL_MODULES ||
                (config_log_1.LOG_CONFIG[_this.moduleName].enabled && config_log_1.LOG_CONFIG[_this.moduleName][level]) ||
                config_log_1.LOG_ALL_LEVEL[level])
                log(args);
        };
        this.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.logIfEnabled.apply(_this, __spreadArray(["debug"], args));
        };
        this.verbose = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.logIfEnabled.apply(_this, __spreadArray(["verbose"], args));
        };
        this.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return log.apply(void 0, __spreadArray([_this.moduleName, "error"], args));
        };
    }
    return Log;
}());
exports.Log = Log;
