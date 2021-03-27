"use strict";
exports.__esModule = true;
exports.log = void 0;
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
