interface LiveAPIObject {
  get: (path: string) => number;
  set: (path: string, value: number) => void;
  unquotedpath: string;
}
