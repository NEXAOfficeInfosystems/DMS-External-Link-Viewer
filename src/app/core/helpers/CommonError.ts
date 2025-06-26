export interface CommonError {
  code?: number;
  statusText: string;
  messages: Array<string>;
  friendlyMessage: string;
  error?: { [key: string]: string } ;
}
export interface CommonErrorResponse {
  error: CommonError;
  status: number;
  statusText: string;
  url: string;
}