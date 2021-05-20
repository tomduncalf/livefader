import { Log, log } from "./lib_Log";
import { LiveApiParameter } from "./lib_maxForLiveUtils";

export interface SavedState {
  scenes: SavedScene[];
  activeSceneIndices: [number, number];
}

export interface SavedLockedParameter {
  path: string;
  lockedValue: number;
}

export interface SavedScene {
  name: string;
  description: string;
  lockedParameters: SavedLockedParameter[];
}

export class LockedParameter {
  constructor(public parameter: LiveApiParameter, public lockedValue: number) {}
}

export class ParameterScene {
  log = new Log("ParameterScene");

  description: string = "";
  lockedParametersById: Record<number, LockedParameter> = {};

  constructor(public name: string) {}

  // We need to rediscover each locked parameter's id on loading state as it could have changed
  static hydrateFromSavedState = (savedState: SavedScene) => {
    const scene = new ParameterScene(savedState.name);

    scene.lockedParametersById = savedState.lockedParameters.reduce((obj, lockedParameter) => {
      const liveParameter = LiveApiParameter.get(lockedParameter.path);
      const parameter = new LockedParameter(liveParameter, lockedParameter.lockedValue);

      obj[Number(liveParameter.id)] = parameter;

      return obj;
    }, {} as Record<number, LockedParameter>);

    return scene;
  };

  isParameterLocked = (parameter: LiveApiParameter) => {
    return this.isParameterLockedById(parameter.id);
  };

  isParameterLockedById = (parameterId: number) => {
    return this.lockedParametersById[parameterId] !== undefined;
  };

  addLockedParameter = (parameter: LiveApiParameter, value: number) => {
    this.log.debug(
      `Adding locked parameter ${parameter.id} with target ${value} to scene ${this.name}`
    );

    this.lockedParametersById[parameter.id] = new LockedParameter(parameter, value);
  };

  forEachLockedParameter = (fn: (lockedParameter: LockedParameter, index: number) => void) => {
    Object.keys(this.lockedParametersById).forEach((key, index) => {
      // @ts-ignore
      fn(this.lockedParametersById[key], index);
    });
  };

  getDescription = () => {
    let description = `Scene ${this.name} ${this.description}\n`;

    this.forEachLockedParameter((param) => {
      description += `${param.parameter.device?.trackIndex! + 1}/${param.parameter.device?.name}/${
        param.parameter.name
      }: ${param.lockedValue.toFixed(2)}\n`;
    });

    return description;
  };

  reset = () => {
    this.lockedParametersById = {};
  };
}

export class TrackedParameter {
  constructor(public parameter: LiveApiParameter, public lastUserValue: number) {}
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
