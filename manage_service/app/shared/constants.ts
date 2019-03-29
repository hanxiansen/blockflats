export const OK = 0;
export const UNUSUAL = -1;
export const ERROR = 1;
export const UNUSUAL_MESSAGE = `(UNUSUAL)\'${UNUSUAL}`;
export const AXIOS_OK = 200;

export interface IResponse<T> {
  statusCode: number;
  errorMessage: string;
  data: T;
}

export interface IInternal<T> {
  code: number;
  msg: string;
  data: T;
}
