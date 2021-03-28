import { log } from "./lib_Log";

export class LockedParameter {
  constructor(public parameterId: number, public lockedValue: number) {}
}

export class ParameterScene {
  description: string = "";
  lockedParameters: LockedParameter[] = [];

  constructor(public name: string) {}
}

export class TrackedParameter {
  constructor(public apiObject: LiveApiObject, public lastUserValue: number) {}
}

export class TrackedParameters {
  private trackedParametersById: Record<number, TrackedParameter> = {};

  isParameterTracked = (id: number) => {
    return this.trackedParametersById[id] !== undefined;
  };

  updateTrackedParameterValue = (id: number, value: number) => {
    if (this.isParameterTracked(id))
      this.trackedParametersById[id].lastUserValue = value;
  };
}
