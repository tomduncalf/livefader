interface LiveApiObject {
  id: number;
  unquotedpath: string;

  get: (path: string) => number;
  set: (path: string, value: number) => void;
}
