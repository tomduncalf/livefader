interface LiveApiObject {
  id: number;
  unquotedpath: string;

  get: <T = number>(path: string) => T;
  set: <T = number>(path: string, value: T) => void;
}
