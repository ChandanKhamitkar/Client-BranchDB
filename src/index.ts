import net from "net";
import { deserializeResponse } from "./utils.js";
import { BranchDBClientOptions, BranchDBResponse } from "./types";

export class Branch {
  private client: net.Socket;
  private host: string;
  private port: number;
  private token?: string;
  private username?: string;
  private isConnected: boolean = false;
  private responseQueue: ((response: BranchDBResponse) => void)[] = [];
  private dataBuffer: Buffer = Buffer.alloc(0);
  private authenticationPromise: Promise<void> | null = null;
  private isAuthenticated: boolean = false;

  constructor(options: BranchDBClientOptions) {
    this.host = options.host;
    this.port = options.port;
    this.token = options.token;
    this.username = options.username;
    this.client = new net.Socket();
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.isAuthenticated) {
        resolve();
        return;
      }

      // Connect
      this.client.connect(this.port, this.host, () => {
        this.isConnected = true;

        if (this.token) {
          // Case 1: A token is provided. Attempt to authenticate.
          this.authenticationPromise = this.authenticate()
            .then(() => {
              this.isAuthenticated = true;
              resolve();
            })
            .catch((err) => {
              this.client.destroy();
              reject(err);
            });
        } else if (this.username) {
          // Case 2: No token, but a username is provided. Register and get a new token.
          this.authenticationPromise = this.registerAndAuthenticate(
            this.username
          )
            .then(() => {
              this.isAuthenticated = true;
              resolve();
            })
            .catch((err) => {
              this.client.destroy();
              reject(err);
            });
        } else {
          // Case 3: No token or username. Reject.
          this.client.destroy();
          reject(new Error("No token or username provided."));
        }
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
        this.isAuthenticated = false;
        console.log("[branch-client] Connection to server closed.");
      });
    });
  }

  private async authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      const authCommand = `AUTH ${this.token}\n`;
      const handler = (response: BranchDBResponse) => {
        if (response.success) {
          console.log("[SDK] Authentication successful");
          resolve();
        } else {
          reject(new Error(response.message));
        }
      };

      this.responseQueue.push(handler);
      this.client.write(authCommand);
    });
  }

  private async registerAndAuthenticate(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const registerCommand = `REGISTER ${username}\n`;
      
      const handler = (response: BranchDBResponse) => {
        if (response.success && response.message) {
          this.token = response.message as string;
          console.log(
            `[SDK] New token generated. Please save this token: ${this.token}`
          );
          this.authenticate().then(resolve).catch(reject);
        } else {
          reject(new Error("Failed to generate token."));
        }
      };
      this.responseQueue.push(handler);
      this.client.write(registerCommand);
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
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const val = {
      data: value,
    };
    let command = `SET ${key} ${JSON.stringify(val)}`;
    if (ttl > 0) {
      command += ` EX ${ttl}`;
    }
    command += `\n`;
    return this.sendCommand(command);
  }

  // GET
  public async get(key: string): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `GET ${key}\n`;
    return this.sendCommand(command);
  }

  // GETALL
  public async getall(): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `GETALL\n`;
    return this.sendCommand(command);
  }

  // DEL
  public async del(key: string): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `DEL ${key}\n`;
    return this.sendCommand(command);
  }

  // EXISTS
  public async exists(key: string): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `EXISTS ${key}\n`;
    return this.sendCommand(command);
  }

  // TTL
  public async ttl(key: string): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `TTL ${key}\n`;
    return this.sendCommand(command);
  }

  // EXPIRE
  public async expire(key: string): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `EXPIRE ${key}\n`;
    return this.sendCommand(command);
  }

  // PERSIST
  public async persist(key: string): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `PERSIST ${key}\n`;
    return this.sendCommand(command);
  }

  // FLUSH
  public async flush(): Promise<BranchDBResponse> {
    if (this.authenticationPromise) {
      await this.authenticationPromise;
    } else {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const command = `FLUSH FORCE\n`;
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

  public disconnect(): void {
    if (this.client) {
      this.client.destroy();
      this.isConnected = false;
      this.isAuthenticated = false;
    }
  }
}
