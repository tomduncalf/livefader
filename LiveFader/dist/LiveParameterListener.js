"use strict";
exports.__esModule = true;
exports.LiveParameterListener = void 0;
var lib_maxForLiveUtils_1 = require("./lib_maxForLiveUtils");
var lib_maxUtils_1 = require("./lib_maxUtils");
var LiveParameterListener = /** @class */ (function () {
    function LiveParameterListener() {
        var _this = this;
        // TODO could make it so this can turn itself on/off and have its own level
        this.log = new lib_maxUtils_1.Log(this.constructor.name);
        this.activeTrackPath = "";
        this.activeDevicePath = "";
        this.activeParameterPath = "";
        this.setupDeviceListener = function () {
            _this.deviceListener.property = "selected_device";
            _this.deviceListener.path = _this.activeTrackPath + " view";
        };
        this.deviceListener = new LiveAPI(function (v) {
            _this.log.verbose("deviceListener " + v);
            if (v[0] === "selected_device") {
                var device = lib_maxForLiveUtils_1.getLiveObjectById(v[2]);
                _this.activeDevicePath = device.unquotedpath;
                _this.log.verbose("deviceListener " + device.get("name"));
            }
        });
        this.trackListener = new LiveAPI(function (v) {
            _this.log.verbose("trackListener " + v);
            if (v[0] === "selected_track") {
                var track = lib_maxForLiveUtils_1.getLiveObjectById(v[2]);
                _this.activeTrackPath = track.unquotedpath;
                _this.log.verbose("track " + track.get("name"));
                _this.setupDeviceListener();
            }
        });
        this.trackListener.property = "selected_track";
        this.trackListener.path = "live_set view";
    }
    return LiveParameterListener;
}());
exports.LiveParameterListener = LiveParameterListener;
//   var paramListener = new LiveAPI(function (v: any[]) {
//     // log("paramListener " + v);
//     if (v[0] === "selected_parameter" && v[2] > 0) {
//       activeParameter = getById(v[2]);
//       activeParameterPath = activeParameter.unquotedpath;
//       setupParamValueListener();
//       handleActiveParameterChanged();
//     }
//   });
//   function setupParamListener() {
//     paramListener.property = "selected_parameter";
//     paramListener.path = "live_set view";
//   }
//   setupParamListener();
//   var propertyValueListener = new LiveAPI(function (v: any[]) {
//     // log("propertyValueListener " + v);
//     handleActiveParameterValueChange(v[1]);
//   });
//   function setupParamValueListener() {
//     propertyValueListener.property = "value";
//     propertyValueListener.path = activeParameterPath;
//   }
// }
