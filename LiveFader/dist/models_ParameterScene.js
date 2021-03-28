"use strict";
var LockedParameter = /** @class */ (function () {
    function LockedParameter(parameterId, targetValue) {
        this.parameterId = parameterId;
        this.targetValue = targetValue;
    }
    return LockedParameter;
}());
var ParameterScene = /** @class */ (function () {
    function ParameterScene(name) {
        this.name = name;
        this.lockedParameters = [];
    }
    return ParameterScene;
}());
