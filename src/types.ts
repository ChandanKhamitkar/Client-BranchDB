export interface BranchDBClientOptions {
  host: string;
  port: number;
  token?: string;
  username?: string;
}

export interface BranchDBResponse {
  statusCode: number;
  success: boolean;
  message: string;
  payloadType: number;
  payload: any;
}
