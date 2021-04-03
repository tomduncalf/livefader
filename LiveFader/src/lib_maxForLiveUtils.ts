import { Log } from "./lib_Log";

const log = new Log("LiveApiObjectWrapper");

export class LiveApiObjectWrapper {
  static get(idOrPath: number | string) {
    return getWrappedLiveApiObject(idOrPath, LiveApiObjectWrapper);
  }

  constructor(public apiObject: LiveAPI) {}

  get path() {
    return this.apiObject.unquotedpath;
  }

  get name() {
    return this.getStringProperty("name");
  }

  get id() {
    return Number(this.apiObject.id);
  }

  getProperty = <T = number>(path: string) => {
    this.apiObject.get(path) as T;
  };

  // Strings returned from the M4L API are not real strings which can trip you up
  getStringProperty = (path: string) => this.apiObject.get(path).toString();
}

export class LiveApiDevice extends LiveApiObjectWrapper {
  private _trackIndex?: number;

  static get(idOrPath: number | string) {
    return getWrappedLiveApiObject(idOrPath, LiveApiDevice);
  }

  get isLiveFaderDevice() {
    return this.name === "LiveFader";
  }

  get trackIndex() {
    if (this._trackIndex) return this._trackIndex;

    const matches = this.path.match(/live_set tracks (\d+) devices \d+/);
    if (!matches || !matches[1]) {
      log.error(`get trackIndex: Path "${this.path}" did not match regex`);
      return undefined;
    }

    this._trackIndex = Number(matches[1]);
    return this._trackIndex;
  }
}

export class LiveApiParameter extends LiveApiObjectWrapper {
  private _device?: LiveApiDevice;

  static get(idOrPath: number | string) {
    return getWrappedLiveApiObject(idOrPath, LiveApiParameter);
  }

  get value() {
    return Number(this.apiObject.get("value"));
  }

  setValue = (value: number) => {
    log.verbose(`Setting value ${value} for ${this.name}`);

    this.apiObject.set("value", value);
  };

  get device() {
    if (this._device) return this._device;

    const matches = this.path.match(/(live_set tracks \d+ devices \d+)/);
    if (!matches || !matches[1]) {
      log.error(`get device: Path "${this.path}" did not match regex`);
      return undefined;
    }

    const devicePath = matches[1];
    const device = LiveApiDevice.get(devicePath);
    this._device = device;

    log.verbose(this._device);

    return device;
  }
}

// Keep a cache of LiveAPI objects by ID to speed up working with then,
// as the ID reference should remain stable for a given session
const liveApiObjectCacheById: Record<number, any> = {};

// The docs claim you should be able to call new LiveAPI(id) but it doesn't seem to work
export const getLiveApiObjectById = (id: number) => {
  const apiObject = new LiveAPI();
  apiObject.id = Number(id);
  return apiObject;
};

export const getLiveApiObjectByPath = (path: string) => {
  const apiObject = new LiveAPI(path);
  return apiObject;
};

const CACHE_LIVE_OBJECTS: true = true;

const getWrappedLiveApiObject = <T extends LiveApiObjectWrapper>(
  idOrPath: number | string,
  objectClass: new (apiObject: LiveAPI) => T
): T => {
  log.verbose(`getWrappedLiveApiObject ${idOrPath}`);

  let rawApiObject: LiveAPI;

  if (typeof idOrPath === "string") {
    rawApiObject = getLiveApiObjectByPath(idOrPath);
  } else {
    if (CACHE_LIVE_OBJECTS && liveApiObjectCacheById[idOrPath])
      return liveApiObjectCacheById[idOrPath];

    rawApiObject = getLiveApiObjectById(idOrPath);
  }

  const wrapper = new objectClass(rawApiObject);
  liveApiObjectCacheById[rawApiObject.id] = wrapper;

  return wrapper;
};
