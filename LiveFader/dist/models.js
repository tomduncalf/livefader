"use strict";
exports.__esModule = true;
exports.TrackedParameters = exports.TrackedParameter = exports.ParameterScene = exports.LockedParameter = void 0;
var LockedParameter = /** @class */ (function () {
    function LockedParameter(parameterId, lockedValue) {
        this.parameterId = parameterId;
        this.lockedValue = lockedValue;
    }
    return LockedParameter;
}());
exports.LockedParameter = LockedParameter;
var ParameterScene = /** @class */ (function () {
    function ParameterScene(name) {
        this.name = name;
        this.description = "";
        this.lockedParameters = [];
    }
    return ParameterScene;
}());
exports.ParameterScene = ParameterScene;
var TrackedParameter = /** @class */ (function () {
    function TrackedParameter(apiObject, lastUserValue) {
        this.apiObject = apiObject;
        this.lastUserValue = lastUserValue;
    }
    return TrackedParameter;
}());
exports.TrackedParameter = TrackedParameter;
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
exports.TrackedParameters = TrackedParameters;
