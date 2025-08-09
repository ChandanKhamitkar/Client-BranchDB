# Client-BranchDB

### Stage: Building Version(1.0.0)

[![Static Badge](https://img.shields.io/badge/license-Apache%202.0-red)](https://github.com/ChandanKhamitkar/Client-BranchDB/blob/main/LICENSE)
![Static Badge](https://img.shields.io/badge/version-1.0.0-blue)


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
};

const client = new Branch(config);

async function main() {
  try {
    await client.connect();
    console.log("Successfully connected and authenticated!");

    const setResponse = await client.set("user:101", '{"name": "Alice"}', 60);
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

## Methods Reference 📚

- The `Branch` client provides the following asynchronous methods:

| Method                | Description                                             |
| --------------------- | ------------------------------------------------------- |
| connect()             | Establishes a connection with the server.               |
| set(key, value, ttl?) | Sets a key-value pair, with an optional TTL in seconds. |
| get(key)              | Retrieves the value for a given key.                    |
| del(key)              | Deletes a key-value pair.                               |
| exists(key)           | Checks if a key exists.                                 |
| ttl(key)              | Returns the remaining time to live for a key.           |
| expire(key, ttl)      | Sets a new TTL for an existing key.                     |
| persist(key)          | Removes the TTL from a key.                             |
| getall()              | Returns a list of all keys in the database.             |
| flush()               | Deletes all keys from the database.                     |

---

# License 📄
This project is licensed under the `Apache-2.0 License`. See the [LICENSE](https://github.com/ChandanKhamitkar/Client-BranchDB/blob/main/LICENSE) file for more.
