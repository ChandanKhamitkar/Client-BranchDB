export interface BranchDBClientOptions {
  host: string;
  port: number;
}

export interface BranchDBResponse {
  statusCode: number;
  success: boolean;
  message: string;
  payloadType: number;
  payload: any;
}
