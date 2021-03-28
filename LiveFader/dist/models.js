"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.State = void 0;
var LockedParameter = /** @class */ (function () {
    function LockedParameter(parameterId, lockedValue) {
        this.parameterId = parameterId;
        this.lockedValue = lockedValue;
    }
    return LockedParameter;
}());
var ParameterScene = /** @class */ (function () {
    function ParameterScene(name) {
        this.name = name;
        this.description = "";
        this.lockedParameters = [];
    }
    return ParameterScene;
}());
var TrackedParameter = /** @class */ (function () {
    function TrackedParameter(apiObject, lastUserValue) {
        this.apiObject = apiObject;
        this.lastUserValue = lastUserValue;
    }
    return TrackedParameter;
}());
// Keep track of every parameter which is locked in any scene, so we can quickly
// access its LiveApiObject to set the value, and also so we can keep track of
// the last value the user set it to so we know what value to return to
var TrackedParameters = /** @class */ (function () {
    function TrackedParameters() {
        var _this = this;
        this.trackedParametersById = {};
        this.isParameterTracked = function (id) {
            return _this.trackedParametersById[id] !== undefined;
        };
        this.updateTrackedParameterValue = function (id, value) {
            if (_this.isParameterTracked(id))
                _this.trackedParametersById[id].lastUserValue = value;
        };
    }
    return TrackedParameters;
}());
var CHAR_CODE_A = 65;
var State = /** @class */ (function () {
    function State() {
        // Keep a reference to the parameters which are locked by the current scenes
        // so we don't have to calculate this every time the crossfader changes
        this.activeLockedParameters = [[], []];
        this.trackedParameters = new TrackedParameters();
        // Populate 8 scenes to start, named A to H
        this.scenes = __spreadArray([], new Array(8)).map(function (_, i) { return new ParameterScene(String.fromCharCode(CHAR_CODE_A + i)); });
        this.activeScenes = [this.scenes[0], this.scenes[1]];
    }
    return State;
}());
exports.State = State;
