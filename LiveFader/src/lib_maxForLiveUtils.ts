import { Log, log } from "./lib_Log";

const liveApiObjectCacheById: Record<number, any> = {};

export class LiveApiObjectWrapper {
  log = new Log("LiveApiObjectWrapper");

  constructor(public apiObject: LiveApiObject) {}

  getPath() {
    return this.apiObject.unquotedpath;
  }

  getName() {
    return this.getStringProperty("name");
  }

  getProperty = <T = number>(path: string) => {
    this.apiObject.get(path) as T;
  };

  getStringProperty = (path: string) => this.apiObject.get(path).toString();
}

export class LiveApiDevice extends LiveApiObjectWrapper {}

export class LiveApiParameter extends LiveApiObjectWrapper {
  device?: LiveApiDevice;

  // path is like "live_set tracks 0 devices 1 parameters 2"
  getDevice = () => {
    if (this.device) return this.device;

    const matches = this.getPath().match(/(live_set tracks \d+ devices \d+)/);
    if (!matches || !matches[1]) {
      this.log.error(`getDevice: Path "${this.getPath()}" did not match regex`);
      return undefined;
    }

    const devicePath = matches[1];
    const device = getLiveApiDevice(devicePath);
    this.device = device;
    return device;
  };
}

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
  ctor: new (apiObject: LiveApiObject) => T
): T => {
  let rawApiObject: LiveApiObject;

  if (typeof idOrPath === "string") {
    rawApiObject = getLiveApiObjectByPath(idOrPath);
  } else {
    if (liveApiObjectCacheById[idOrPath]) return liveApiObjectCacheById[idOrPath];

    rawApiObject = getLiveApiObjectById(idOrPath);
  }

  const wrapper = new ctor(rawApiObject);
  liveApiObjectCacheById[rawApiObject.id] = wrapper;

  return wrapper;
};

export const getLiveApiDevice = (idOrPath: number | string): LiveApiDevice => {
  return getWrappedLiveApiObject(idOrPath, LiveApiDevice);
};

export const getLiveApiParameter = (idOrPath: number | string): LiveApiParameter => {
  return getWrappedLiveApiObject(idOrPath, LiveApiParameter);
};
