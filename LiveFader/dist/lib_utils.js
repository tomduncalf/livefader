"use strict";
exports.__esModule = true;
exports.CallbackList = void 0;
var CallbackList = /** @class */ (function () {
    function CallbackList() {
        var _this = this;
        this.callbacks = [];
        this.add = function (callback) {
            _this.callbacks.push(callback);
        };
        this.call = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.callbacks.forEach(function (c) { return c.apply(void 0, args); });
        };
    }
    return CallbackList;
}());
exports.CallbackList = CallbackList;
