"use strict";
exports.__esModule = true;
exports.getLiveObjectById = void 0;
var getLiveObjectById = function (id) {
    var api = new LiveAPI();
    api.id = Number(id);
    return api;
};
exports.getLiveObjectById = getLiveObjectById;
