# Client-BranchDB

### Stage: Building Version(2.0.1)

[![Static Badge](https://img.shields.io/badge/license-Apache%202.0-red)](https://github.com/ChandanKhamitkar/Client-BranchDB/blob/main/LICENSE)
![Static Badge](https://img.shields.io/badge/version-2.0.1-blue)

## Introduction 🚀

- `branchdb-client` is the official Node.js client SDK for Branch DB, a lightweight, in-memory key-value database. This SDK handles all the complexities of network communication and protocol serialization, allowing you to interact with your Branch DB server using a simple, asynchronous Methods.

## Features ✨

- **Persistent Connections:** Manages a single, persistent TCP connection to your Branch DB server.
  Asynchronous API: All methods return Promises, making it easy to integrate into modern Node.js applications using async/await.

- **Type-Safe Responses:** Handles the deserialization of the server's custom binary protocol, providing structured responses with status codes and payloads.

- **Data Manipulation:** Provides high-level methods for all core database operations, including `SET`, `GET`, `DEL`, `TTL`, `GETALL`, `FLUSH FORCE`, `EXISTS`, `PERSIST` and `EXPIRE`.

---

## Installation 📦

To install the SDK, run the following command in your project directory:

```
npm install branchdb-client
```

---

## Getting Started 🧑‍💻

- This example shows you how to connect to your Branch DB server and perform basic operations.

### Prerequisites

- The Branch DB server must be running and listening on a specified port (default: 1981).

### Example Usage

```js
import { Branch } from "branchdb-client";

const config = {
  host: process.env.BRANCH_DB_HOST || "localhost",
  port: parseInt(process.env.BRANCH_DB_PORT || "1981"),
  username: "ChandanKhamitkar-Project"
  token: process.env.BRANCH_DB_TOKEN || "833ca2ed8d1677323241d17b1e240ba5a976dc9d9c7e367bcb7d6b2f95cb4d34",
};

const client = new Branch(config);

async function main() {
  try {
    await client.connect();
    console.log("Successfully connected and authenticated!");

    const setResponse = await client.set("user101", {name: "Alice"}, 30);
    console.log("SET response:", setResponse);

    const getResponse = await client.get("user:101");
    console.log("GET response:", getResponse);

    const delResponse = await client.del("user:101");
    console.log("DEL response:", delResponse);

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
```

---

# API Reference 📚

## 🔌 Connection
- `new Branch(config)` - Initializes the client. 
  - Defaults: `host = '127.0.0.1' or 'localhost', port = 1981`.
- `connect()` Establishes TCP connection to the BranchDB `server.
- `disconnect()` Closes the client connection.

## 🔐 Authentication
- **If no token exists**
  - `.connect()` automatically handles authentication.
  - Calls the `REGISTER username` command, stores the generated token in `<hash>`, and returns it. **(Requires a username)**
- **If a token exists**
  - Pass it via `.env` file or directly in config.
  - The token will be authenticated, and the client will be allowed to perform data read/write operations.

# Methods 

- The `Branch` client provides the following asynchronous methods:

| Method                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `connect()`             | Establishes a connection with the server.                   |
| `set(key, value, ttl?)` | Sets a key-value pair, with an optional TTL in seconds.     |
| `get(key)`              | Retrieves the value for a given key.                        |
| `del(key)`              | Deletes a key-value pair.                                   |
| `exists(key)`           | Checks if a key exists.                                     |
| `ttl(key)`              | Returns the remaining time to live for a key.               |
| `expire(key, ttl)`      | Sets a new TTL for an existing key.                         |
| `persist(key)`          | Removes the TTL from a key.                                 |
| `getall()`              | Returns a list of all keys in the database.                 |
| `flush()`               | Deletes all keys from the database.                         |
| `disconnect()`          | Terminates the Session TCP connection with BranchDB server. |

---

# License 📄

This project is licensed under the `Apache-2.0 License`. See the [LICENSE](https://github.com/ChandanKhamitkar/Client-BranchDB/blob/main/LICENSE) file for more.
