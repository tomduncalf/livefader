"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.LiveFader = void 0;
var lib_Log_1 = require("./lib_Log");
var LiveParameterListener_1 = require("./LiveParameterListener");
var models_1 = require("./models");
var CHAR_CODE_A = 65;
var Inlets;
(function (Inlets) {
    Inlets[Inlets["LeftButton"] = 0] = "LeftButton";
    Inlets[Inlets["RightButton"] = 1] = "RightButton";
    Inlets[Inlets["Fader"] = 2] = "Fader";
    Inlets[Inlets["FullScreenButton"] = 3] = "FullScreenButton";
})(Inlets || (Inlets = {}));
// Main entry point class which hooks everything together
var LiveFader = /** @class */ (function () {
    function LiveFader() {
        var _this = this;
        this.log = new lib_Log_1.Log("LiveFader");
        // Keep a reference to the parameters which are locked by the current scenes
        // so we don't have to calculate this every time the crossfader changes
        this.activeLockedParameters = [[], []];
        // Keep track of every parameter which is locked in any scene, so we can quickly
        // access its LiveApiObject to set the value, and also so we can keep track of
        // the last value the user set it to so we know what value to return to
        this.trackedParameters = new models_1.TrackedParameters();
        this.liveParameterListener = new LiveParameterListener_1.LiveParameterListener();
        this.currentMappingScene = undefined;
        this.handleMessage = function (inlet, value) {
            if (inlet === Inlets.LeftButton || inlet === Inlets.RightButton) {
                if (value === 0) {
                    _this.currentMappingScene = undefined;
                }
                else {
                    _this.currentMappingScene = _this.activeScenes[inlet === Inlets.LeftButton ? 0 : 1];
                }
            }
        };
        this.handleActiveParameterValueChanged = function (value) {
            _this.log.verbose("handleActiveParameterValueChanged", value);
            if (_this.currentMappingScene === undefined)
                return;
            _this.log.verbose("handleActiveParameterValueChanged 2", value);
        };
        // Populate 8 scenes to start, named A to H
        this.scenes = __spreadArray([], new Array(8)).map(function (_, i) { return new models_1.ParameterScene(String.fromCharCode(CHAR_CODE_A + i)); });
        this.activeScenes = [this.scenes[0], this.scenes[1]];
        this.liveParameterListener.onActiveParameterValueChanged = this.handleActiveParameterValueChanged;
    }
    return LiveFader;
}());
exports.LiveFader = LiveFader;
