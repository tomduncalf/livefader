"use strict";
exports.__esModule = true;
exports.LiveParameterListener = void 0;
var lib_maxForLiveUtils_1 = require("./lib_maxForLiveUtils");
var lib_Log_1 = require("./lib_Log");
var LiveParameterListener = /** @class */ (function () {
    function LiveParameterListener() {
        var _this = this;
        this.log = new lib_Log_1.Log("LiveParameterListener");
        this.onActiveParameterChanged = function () { };
        this.onActiveParameterValueChanged = function () { };
        this.activeTrackPath = "";
        this.activeDevicePath = "";
        this.activeParameterPath = "";
        this.setupParameterValueListener = function () {
            _this.parameterValueListener = new LiveAPI(function (v) {
                _this.log.verbose("propertyValueListener " + v);
                _this.onActiveParameterValueChanged(v[1]);
            });
        };
        this.resetParameterValueListener = function () {
            _this.parameterValueListener.property = "value";
            _this.parameterValueListener.path = _this.activeParameterPath;
        };
        this.setupParameterListener = function () {
            _this.parameterListener = new LiveAPI(function (v) {
                _this.log.verbose("parameterListener " + v);
                if (v[0] === "selected_parameter" && v[2] > 0) {
                    _this.activeParameter = lib_maxForLiveUtils_1.getLiveObjectById(v[2]);
                    _this.activeParameterPath = _this.activeParameter.unquotedpath;
                    _this.resetParameterValueListener();
                    _this.onActiveParameterChanged(_this.activeParameter);
                }
            });
        };
        this.resetParameterListener = function () {
            _this.parameterListener.property = "selected_parameter";
            _this.parameterListener.path = "live_set view";
        };
        this.setupDeviceListener = function () {
            _this.deviceListener = new LiveAPI(function (v) {
                _this.log.verbose("deviceListener " + v);
                if (v[0] === "selected_device") {
                    var device = lib_maxForLiveUtils_1.getLiveObjectById(v[2]);
                    _this.activeDevicePath = device.unquotedpath;
                    _this.resetParameterListener();
                    _this.log.verbose("deviceListener " + device.get("name"));
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
                    var track = lib_maxForLiveUtils_1.getLiveObjectById(v[2]);
                    _this.activeTrackPath = track.unquotedpath;
                    _this.log.verbose("track " + track.get("name"));
                    _this.resetDeviceListener();
                }
            });
            _this.trackListener.property = "selected_track";
            _this.trackListener.path = "live_set view";
        };
        this.setupParameterValueListener();
        this.setupParameterListener();
        this.setupDeviceListener();
        this.setupTrackListener();
    }
    return LiveParameterListener;
}());
exports.LiveParameterListener = LiveParameterListener;
