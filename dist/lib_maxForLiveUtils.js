"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiveApiObjectByPath = exports.getLiveApiObjectById = exports.LiveApiParameter = exports.LiveApiDevice = exports.LiveApiObjectWrapper = void 0;
var lib_Log_1 = require("./lib_Log");
var log = new lib_Log_1.Log("LiveApiObjectWrapper");
var LiveApiObjectWrapper = /** @class */ (function () {
    function LiveApiObjectWrapper(apiObject) {
        var _this = this;
        this.apiObject = apiObject;
        this.getProperty = function (path) {
            _this.apiObject.get(path);
        };
        // Strings returned from the M4L API are not real strings which can trip you up
        this.getStringProperty = function (path) { return _this.apiObject.get(path).toString(); };
    }
    LiveApiObjectWrapper.get = function (idOrPath) {
        return getWrappedLiveApiObject(idOrPath, LiveApiObjectWrapper);
    };
    Object.defineProperty(LiveApiObjectWrapper.prototype, "path", {
        get: function () {
            return this.apiObject.unquotedpath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LiveApiObjectWrapper.prototype, "name", {
        get: function () {
            return this.getStringProperty("name");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LiveApiObjectWrapper.prototype, "id", {
        get: function () {
            return Number(this.apiObject.id);
        },
        enumerable: false,
        configurable: true
    });
    return LiveApiObjectWrapper;
}());
exports.LiveApiObjectWrapper = LiveApiObjectWrapper;
var LiveApiDevice = /** @class */ (function (_super) {
    __extends(LiveApiDevice, _super);
    function LiveApiDevice() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LiveApiDevice.get = function (idOrPath) {
        return getWrappedLiveApiObject(idOrPath, LiveApiDevice);
    };
    Object.defineProperty(LiveApiDevice.prototype, "isLiveFaderDevice", {
        get: function () {
            return this.name.indexOf("LiveFader") > -1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LiveApiDevice.prototype, "trackIndex", {
        get: function () {
            if (this._trackIndex)
                return this._trackIndex;
            var matches = this.path.match(/live_set tracks (\d+) devices \d+/);
            if (!matches || !matches[1]) {
                log.error("get trackIndex: Path \"" + this.path + "\" did not match regex");
                return undefined;
            }
            this._trackIndex = Number(matches[1]);
            return this._trackIndex;
        },
        enumerable: false,
        configurable: true
    });
    return LiveApiDevice;
}(LiveApiObjectWrapper));
exports.LiveApiDevice = LiveApiDevice;
var LiveApiParameter = /** @class */ (function (_super) {
    __extends(LiveApiParameter, _super);
    function LiveApiParameter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setValue = function (value) {
            log.verbose("Setting value " + value + " for " + _this.name);
            _this.apiObject.set("value", value);
        };
        return _this;
    }
    LiveApiParameter.get = function (idOrPath) {
        return getWrappedLiveApiObject(idOrPath, LiveApiParameter);
    };
    Object.defineProperty(LiveApiParameter.prototype, "value", {
        get: function () {
            return Number(this.apiObject.get("value"));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LiveApiParameter.prototype, "device", {
        get: function () {
            if (this._device)
                return this._device;
            var matches = this.path.match(/(live_set tracks \d+ devices \d+)/);
            if (!matches || !matches[1]) {
                log.error("get device: Path \"" + this.path + "\" did not match regex");
                return undefined;
            }
            var devicePath = matches[1];
            var device = LiveApiDevice.get(devicePath);
            this._device = device;
            log.verbose(this._device);
            return device;
        },
        enumerable: false,
        configurable: true
    });
    return LiveApiParameter;
}(LiveApiObjectWrapper));
exports.LiveApiParameter = LiveApiParameter;
// Keep a cache of LiveAPI objects by ID to speed up working with then,
// as the ID reference should remain stable for a given session
var liveApiObjectCacheById = {};
// The docs claim you should be able to call new LiveAPI(id) but it doesn't seem to work
var getLiveApiObjectById = function (id) {
    var apiObject = new LiveAPI();
    apiObject.id = Number(id);
    return apiObject;
};
exports.getLiveApiObjectById = getLiveApiObjectById;
var getLiveApiObjectByPath = function (path) {
    var apiObject = new LiveAPI(path);
    return apiObject;
};
exports.getLiveApiObjectByPath = getLiveApiObjectByPath;
var CACHE_LIVE_OBJECTS = true;
var getWrappedLiveApiObject = function (idOrPath, objectClass) {
    log.verbose("getWrappedLiveApiObject " + idOrPath);
    var rawApiObject;
    if (typeof idOrPath === "string") {
        rawApiObject = exports.getLiveApiObjectByPath(idOrPath);
    }
    else {
        if (CACHE_LIVE_OBJECTS && liveApiObjectCacheById[idOrPath])
            return liveApiObjectCacheById[idOrPath];
        rawApiObject = exports.getLiveApiObjectById(idOrPath);
    }
    var wrapper = new objectClass(rawApiObject);
    liveApiObjectCacheById[rawApiObject.id] = wrapper;
    return wrapper;
};
