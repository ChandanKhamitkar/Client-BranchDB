import net from "net";
import { deserializeResponse } from "./utils.js";
import { BranchDBClientOptions, BranchDBResponse } from "./types";

export class Branch {
  private client: net.Socket;
  private host: string;
  private port: number;
  private isConnected: boolean = false;
  private responseQueue: ((response: BranchDBResponse) => void)[] = [];
  private dataBuffer: Buffer = Buffer.alloc(0);

  constructor(options: BranchDBClientOptions) {
    this.host = options.host;
    this.port = options.port;
    this.client = new net.Socket();
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      // Connect
      this.client.connect(this.port, this.host, () => {
        this.isConnected = true;
        // this.authenticate();
      });

      // Data
      this.client.on("data", (data) => {
        this.dataBuffer = Buffer.concat([this.dataBuffer, data]);
        this.processDataBuffer();
      });

      // Error
      this.client.on("error", (err) => {
        this.isConnected = false;
        reject(new Error(`Connectoin error: ${err.message}`));
      });

      // Close
      this.client.on("close", () => {
        this.isConnected = false;
        console.log("[@branch/client] Connection to server closed.");
      });
    });
  }

  private processDataBuffer(): void {
    const newlineIndex = this.dataBuffer.indexOf("\n");
    if (newlineIndex !== -1) {
      const rawResponse = this.dataBuffer.slice(0, newlineIndex + 1);
      this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1);

      if (this.responseQueue.length > 0) {
        const handler = this.responseQueue.shift()!; // remove 1st element and return it.
        const deserializedResponse = deserializeResponse(rawResponse);
        handler(deserializedResponse); // resolving the waiting command.
      }
    }
  }

  // SET
  public async set(
    key: string,
    value: string,
    ttl: number = 0
  ): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }
    const val = {
      data: value,
    };
    const command = `SET ${key} ${JSON.stringify(val)}${
      ttl > 0 ? ` EX ${ttl}` : ""
    }\n`;
    return this.sendCommand(command);
  }

  // GET
  public async get(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `GET ${key}\n`;
    return this.sendCommand(command);
  }

  // GETALL
  public async getall(): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `GETALL\n`;
    return this.sendCommand(command);
  }

  // DEL
  public async del(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `DEL ${key}\n`;
    return this.sendCommand(command);
  }

  // EXISTS
  public async exists(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `EXISTS ${key}\n`;
    return this.sendCommand(command);
  }

  // TTL
  public async ttl(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `TTL ${key}\n`;
    return this.sendCommand(command);
  }

  // EXPIRE
  public async expire(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `EXPIRE ${key}\n`;
    return this.sendCommand(command);
  }

  // PERSIST
  public async persist(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `PERSIST ${key}\n`;
    return this.sendCommand(command);
  }

  // FLUSH
  public async flush(key: string): Promise<BranchDBResponse> {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `FLUSH FORCE ${key}\n`;
    return this.sendCommand(command);
  }

  private async sendCommand(command: string): Promise<BranchDBResponse> {
    return new Promise((resolve, reject) => {
      const handler = (response: BranchDBResponse) => {
        resolve(response);
      };
      this.responseQueue.push(handler);
      this.client.write(command);
    });
  }
}
