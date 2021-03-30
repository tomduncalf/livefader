import { Log, log } from "./lib_Log";

const liveApiObjectCacheById: Record<number, any> = {};

export class LiveApiObjectWrapper {
  log = new Log("LiveApiObjectWrapper");

  constructor(public apiObject: LiveApiObject) {}

  getPath() {
    return this.apiObject.unquotedpath;
  }

  getPropertyValue = <T = number>(path: string) => {
    this.apiObject.get(path) as T;
  };

  getStringPropertyValue = (path: string) => this.apiObject.get(path).toString();
}

export class LiveApiDevice extends LiveApiObjectWrapper {}

export class LiveApiParameter extends LiveApiObjectWrapper {
  device?: LiveApiDevice;

  // path is like "live_set tracks 0 devices 1 parameters 2"
  getDevice = () => {
    if (this.device) return this.device;

    const matches = this.getPath().match(/(?<devicePath>live_set tracks \d+ devices \d+)/);
    if (!matches || !matches[1]) {
      this.log.error(`getDevice: Path "${this.getPath()}" did not match regex`);
      return undefined;
    }

    const devicePath = matches[1];
    const device = getLiveApiDeviceById(devicePath);
    this.log.debug("DEVICE", device);

    this.device = device;
    return device;
  };
}

export const getLiveApiObjectById = (id: number) => {
  const apiObject = new LiveAPI();
  apiObject.id = Number(id);
  return apiObject;
};

const getWrappedLiveApiObjectById = <T extends LiveApiObjectWrapper>(
  id: number,
  ctor: new (apiObject: LiveApiObject) => T
): T => {
  if (liveApiObjectCacheById[id]) return liveApiObjectCacheById[id];

  const apiObject = new LiveAPI(id);

  const wrapper = new ctor(apiObject);
  liveApiObjectCacheById[id] = wrapper;

  return wrapper;
};

export const getLiveApiDeviceById = (id: number): LiveApiDevice => {
  return getWrappedLiveApiObjectById(id, LiveApiDevice);
};

export const getLiveApiParameterById = (id: number): LiveApiParameter => {
  return getWrappedLiveApiObjectById(id, LiveApiParameter);
};
