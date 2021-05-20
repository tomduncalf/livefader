"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackedParameter = exports.ParameterScene = exports.LockedParameter = void 0;
var lib_Log_1 = require("./lib_Log");
var lib_maxForLiveUtils_1 = require("./lib_maxForLiveUtils");
var LockedParameter = /** @class */ (function () {
    function LockedParameter(parameter, lockedValue) {
        this.parameter = parameter;
        this.lockedValue = lockedValue;
    }
    return LockedParameter;
}());
exports.LockedParameter = LockedParameter;
var ParameterScene = /** @class */ (function () {
    function ParameterScene(name) {
        var _this = this;
        this.name = name;
        this.log = new lib_Log_1.Log("ParameterScene");
        this.description = "";
        this.lockedParametersById = {};
        this.isParameterLocked = function (parameter) {
            return _this.isParameterLockedById(parameter.id);
        };
        this.isParameterLockedById = function (parameterId) {
            return _this.lockedParametersById[parameterId] !== undefined;
        };
        this.addLockedParameter = function (parameter, value) {
            _this.log.debug("Adding locked parameter " + parameter.id + " with target " + value + " to scene " + _this.name);
            _this.lockedParametersById[parameter.id] = new LockedParameter(parameter, value);
        };
        this.forEachLockedParameter = function (fn) {
            Object.keys(_this.lockedParametersById).forEach(function (key, index) {
                // @ts-ignore
                fn(_this.lockedParametersById[key], index);
            });
        };
        this.getDescription = function () {
            var description = "Scene " + _this.name + " " + _this.description + "\n";
            _this.forEachLockedParameter(function (param) {
                var _a, _b;
                description += ((_a = param.parameter.device) === null || _a === void 0 ? void 0 : _a.trackIndex) + 1 + "/" + ((_b = param.parameter.device) === null || _b === void 0 ? void 0 : _b.name) + "/" + param.parameter.name + ": " + param.lockedValue.toFixed(2) + "\n";
            });
            return description;
        };
        this.reset = function () {
            _this.lockedParametersById = {};
        };
    }
    // We need to rediscover each locked parameter's id on loading state as it could have changed
    ParameterScene.hydrateFromSavedState = function (savedState) {
        var scene = new ParameterScene(savedState.name);
        scene.lockedParametersById = savedState.lockedParameters.reduce(function (obj, lockedParameter) {
            var liveParameter = lib_maxForLiveUtils_1.LiveApiParameter.get(lockedParameter.path);
            var parameter = new LockedParameter(liveParameter, lockedParameter.lockedValue);
            obj[Number(liveParameter.id)] = parameter;
            return obj;
        }, {});
        return scene;
    };
    return ParameterScene;
}());
exports.ParameterScene = ParameterScene;
var TrackedParameter = /** @class */ (function () {
    function TrackedParameter(parameter, lastUserValue) {
        this.parameter = parameter;
        this.lastUserValue = lastUserValue;
    }
    return TrackedParameter;
}());
exports.TrackedParameter = TrackedParameter;
/*export class TrackedParameters {
  private trackedParametersById: Record<number, TrackedParameter> = {};

  isParameterTracked = (id: number) => {
    return this.trackedParametersById[id] !== undefined;
  };

  addOrUpdateTrackedParameter = (id: number, value: number) => {
    if (!this.isParameterTracked(id)) this.addTrackedParameter(id, value);
    else this.updateTrackedParameterValue(id, value);
  };

  addTrackedParameter = (id: number, value: number) => {
    this.trackedParametersById[id] = new TrackedParameter(id, value);
  };

  updateTrackedParameterValue = (id: number, value: number) => {
    if (this.isParameterTracked(id)) this.trackedParametersById[id].lastUserValue = value;
  };
}*/
