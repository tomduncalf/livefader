import { Log, log } from "./lib_Log";

export class LockedParameter {
  constructor(public parameterId: number, public lockedValue: number) {}
}

export class ParameterScene {
  log = new Log("ParameterScene");

  description: string = "";
  lockedParametersById: Record<number, LockedParameter> = {};

  constructor(public name: string) {}

  isParameterLocked = (parameter: LiveApiObject) => {
    return this.isParameterLockedById(parameter.id);
  };

  isParameterLockedById = (parameterId: number) => {
    return this.lockedParametersById[parameterId] !== undefined;
  };

  addLockedParameter = (parameter: LiveApiObject, value: number) => {
    this.log.debug(
      `Adding locked parameter ${parameter.id} with target ${value} to scene ${this.name}`
    );

    this.lockedParametersById[parameter.id] = new LockedParameter(parameter.id, value);
  };

  forEachLockedParameter = (fn: (lockedParameter: LockedParameter, index: number) => void) => {
    Object.keys(this.lockedParametersById).forEach((key, index) => {
      // @ts-ignore
      fn(this.lockedParametersById[key], index);
    });
  };
}

export class TrackedParameter {
  constructor(public apiObject: LiveApiObject, public lastUserValue: number) {}
}

/*export class TrackedParameters {
  private trackedParametersById: Record<number, TrackedParameter> = {};

  isParameterTracked = (id: number) => {
    return this.trackedParametersById[id] !== undefined;
  };

  addOrUpdateTrackedParameter = (id: number, value: number) => {
    if (!this.isParameterTracked(id)) this.addTrackedParameter(id, value);
    else this.updateTrackedParameterValue(id, value);
  };

  addTrackedParameter = (id: number, value: number) => {
    this.trackedParametersById[id] = new TrackedParameter(id, value);
  };

  updateTrackedParameterValue = (id: number, value: number) => {
    if (this.isParameterTracked(id)) this.trackedParametersById[id].lastUserValue = value;
  };
}*/
