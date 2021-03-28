"use strict";
exports.__esModule = true;
exports.LiveFader = void 0;
var LiveParameterListener_1 = require("./LiveParameterListener");
var models_1 = require("./models");
// Main entry point class which hooks everything together
var LiveFader = /** @class */ (function () {
    function LiveFader() {
        this.state = new models_1.State();
        this.liveParameterListener = new LiveParameterListener_1.LiveParameterListener();
    }
    return LiveFader;
}());
exports.LiveFader = LiveFader;
