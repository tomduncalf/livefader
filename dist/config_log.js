"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OUTLET_LOG_LINES = exports.LOG_TO_OUTLET = exports.LOG_ALL_LEVEL = exports.LOG_ALL_MODULES = exports.LOG_CONFIG = void 0;
exports.LOG_CONFIG = {
    LiveParameterListener: {
        enabled: true,
        debug: true,
        verbose: false,
    },
    LiveFader: {
        enabled: true,
        debug: true,
        verbose: true,
    },
    ParameterScene: {
        enabled: true,
        debug: true,
        verbose: false,
    },
    LiveApiObjectWrapper: {
        enabled: true,
        debug: true,
        verbose: false,
    },
};
exports.LOG_ALL_MODULES = false;
exports.LOG_ALL_LEVEL = {
    debug: false,
    verbose: false,
};
exports.LOG_TO_OUTLET = true;
exports.OUTLET_LOG_LINES = 10;
