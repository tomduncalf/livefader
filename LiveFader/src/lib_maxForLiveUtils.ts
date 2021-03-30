import { Log } from "./lib_Log";

export class LiveApiObjectWrapper {
  log = new Log("LiveApiObjectWrapper");

  constructor(public apiObject: LiveApiObject) {}

  get path() {
    return this.apiObject.unquotedpath;
  }

  get name() {
    return this.getStringProperty("name");
  }

  getProperty = <T = number>(path: string) => {
    this.apiObject.get(path) as T;
  };

  // Strings returned from the M4L API are not real strings which can trip you up
  getStringProperty = (path: string) => this.apiObject.get(path).toString();
}

export class LiveApiDevice extends LiveApiObjectWrapper {}

export class LiveApiParameter extends LiveApiObjectWrapper {
  device?: LiveApiDevice;

  getDevice = () => {
    if (this.device) return this.device;

    const matches = this.path.match(/(live_set tracks \d+ devices \d+)/);
    if (!matches || !matches[1]) {
      this.log.error(`getDevice: Path "${this.path}" did not match regex`);
      return undefined;
    }

    const devicePath = matches[1];
    const device = getLiveApiDevice(devicePath);
    this.device = device;

    return device;
  };
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

const getWrappedLiveApiObject = <T extends LiveApiObjectWrapper>(
  idOrPath: number | string,
  objectClass: new (apiObject: LiveApiObject) => T
): T => {
  let rawApiObject: LiveApiObject;

  if (typeof idOrPath === "string") {
    rawApiObject = getLiveApiObjectByPath(idOrPath);
  } else {
    if (liveApiObjectCacheById[idOrPath]) return liveApiObjectCacheById[idOrPath];

    rawApiObject = getLiveApiObjectById(idOrPath);
  }

  const wrapper = new objectClass(rawApiObject);
  liveApiObjectCacheById[rawApiObject.id] = wrapper;

  return wrapper;
};

export const getLiveApiDevice = (idOrPath: number | string): LiveApiDevice => {
  return getWrappedLiveApiObject(idOrPath, LiveApiDevice);
};

export const getLiveApiParameter = (idOrPath: number | string): LiveApiParameter => {
  return getWrappedLiveApiObject(idOrPath, LiveApiParameter);
};
