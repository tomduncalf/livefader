"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveParameterListener = void 0;
var lib_maxForLiveUtils_1 = require("./lib_maxForLiveUtils");
var lib_Log_1 = require("./lib_Log");
/**
 * A LiveParameterListener listens for changes to the active track, active device,
 * active parameter and value of the active parameter in an Ableton Live set and
 * calls the corresponding onActive...Changed callback when one changes.
 */
var LiveParameterListener = /** @class */ (function () {
    function LiveParameterListener() {
        var _this = this;
        this.log = new lib_Log_1.Log("LiveParameterListener");
        this.onActiveParameterChanged = function () { };
        this.onActiveParameterValueChanged = function () { };
        this.activeTrackPath = "";
        this.activeDevicePath = "";
        this.activeDeviceName = "";
        this.activeParameterPath = "";
        // This should be called before reloading JS, otherwise listeners from previous loads persist.
        // See https://cycling74.com/forums/how-to-destroy-a-liveapi-object-instantiated-in-js
        this.removeListeners = function () {
            _this.log.debug("Removing listeners");
            _this.trackListener.property = "";
            _this.deviceListener.property = "";
            _this.parameterListener.property = "";
            _this.parameterValueListener.property = "";
        };
        this.setupParameterValueListener = function () {
            _this.parameterValueListener = new LiveAPI(function (v) {
                var _a;
                if (!_this.activeParameter.device.isLiveFaderDevice) {
                    _this.log.verbose("propertyValueListener " + _this.activeParameter.device.name + " " + ((_a = _this.activeParameter) === null || _a === void 0 ? void 0 : _a.value));
                    _this.onActiveParameterValueChanged(_this.activeParameter.value, _this.activeParameter);
                }
            });
        };
        this.resetParameterValueListener = function () {
            _this.parameterValueListener.property = "value";
            _this.parameterValueListener.path = _this.activeParameterPath;
        };
        this.setupParameterListener = function () {
            _this.parameterListener = new LiveAPI(function (v) {
                var _a;
                _this.log.verbose("parameterListener " + v);
                if (v[0] === "selected_parameter" && v[2] > 0) {
                    _this.activeParameter = lib_maxForLiveUtils_1.LiveApiParameter.get(v[2]);
                    _this.activeParameterPath = _this.activeParameter.path;
                    _this.resetParameterValueListener();
                    if (!((_a = _this.activeDevice) === null || _a === void 0 ? void 0 : _a.isLiveFaderDevice))
                        _this.onActiveParameterChanged(_this.activeParameter, _this.activeDevice);
                }
            });
        };
        // Seems like we need to reset this whenever the device changes, maybe I am doing something wrong!
        this.resetParameterListener = function () {
            _this.parameterListener.property = "selected_parameter";
            _this.parameterListener.path = "live_set view";
        };
        this.setupDeviceListener = function () {
            _this.deviceListener = new LiveAPI(function (v) {
                _this.log.verbose("deviceListener " + v);
                if (v[0] === "selected_device") {
                    _this.activeDevice = lib_maxForLiveUtils_1.LiveApiDevice.get(v[2]);
                    _this.activeDevicePath = _this.activeDevice.path;
                    _this.resetParameterListener();
                    _this.log.verbose("deviceListener " + _this.activeDevice.name);
                }
            });
        };
        this.resetDeviceListener = function () {
            _this.deviceListener.property = "selected_device";
            _this.deviceListener.path = _this.activeTrackPath + " view";
        };
        this.setupTrackListener = function () {
            _this.trackListener = new LiveAPI(function (v) {
                _this.log.verbose("trackListener " + v);
                if (v[0] === "selected_track") {
                    var track = lib_maxForLiveUtils_1.LiveApiObjectWrapper.get(v[2]);
                    _this.activeTrackPath = track.path;
                    _this.log.verbose("track " + track.name);
                    _this.resetDeviceListener();
                }
            });
            _this.trackListener.property = "selected_track";
            _this.trackListener.path = "live_set view";
        };
        this.log.debug("LiveParameterListener constructed");
        this.setupParameterValueListener();
        this.setupParameterListener();
        this.setupDeviceListener();
        this.setupTrackListener();
    }
    return LiveParameterListener;
}());
exports.LiveParameterListener = LiveParameterListener;
