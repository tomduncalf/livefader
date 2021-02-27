declare var inlets: number;
declare var inlet: number;
declare var outlets: number;
declare var outlet: (outlet: number, ...args: any) => void;
declare var post: (x: any) => void;
declare var LiveAPI: any;
declare var Task: any;

interface LiveAPIObject {
  get: (path: string) => number;
  set: (path: string, value: number) => void;
  unquotedpath: string;
}
