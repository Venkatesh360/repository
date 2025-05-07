
# TCP Stock Packet Client

This Node.js application connects to a TCP server to retrieve stock trading packets. It ensures packets are received in the correct sequence, re-requests any missing packets, parses the binary data, and outputs it to a JSON file.



## 📦 Project Structure

```
project/
├── main.js         # Entry point to run the client logic
├── client.js       # Core TCP logic to fetch and parse stock packets
└── stockData.json  # Output file (generated)
```

---

## ⚙️ Configuration

```js
const HOSTNAME = 'localhost';
const PORT = 3000;
```
The script connects to a TCP server running locally on port 3000.

---

## 🚀 How to Use

1. **Install Node.js**  
If not already installed, download and install Node.js from [nodejs.org](https://nodejs.org).

2. **Clone or Download the Project**

```bash
git clone <your-repo-url>
cd project
```

3. **Run the Application**  
You should always run the entry point file `main.js` to start the process.

```bash
node main.js
```
This file simply invokes the core logic from `client.js`.

4. **Output**  
Once the process completes, you’ll find the parsed stock data in:

```
stockData.json
```

---

## 📂 File Descriptions

**client.js**  
Handles all low-level TCP communication:
- Connects to the server
- Sends fetch and resend requests
- Parses incoming packets
- Detects and re-requests missing packets
- Outputs final data as JSON

**main.js**  
Acts as the script entry point. It simply imports and triggers the initial fetch from `client.js`.

```js
// main.js
const client = require('./client');

// Kick off the data retrieval
client.getAll();
```

---

## 📌 Packet Structure

Each packet received from the server is 17 bytes and includes the following:

| Bytes | Field                | Type                  |
|-------|----------------------|------------------------|
| 0–3   | Symbol               | ASCII String (4)       |
| 4     | Buy/Sell Indicator   | ASCII Char ('B'/'S')   |
| 5–8   | Quantity             | UInt32BE               |
| 9–12  | Price                | UInt32BE               |
| 13–16 | Sequence Number      | UInt32BE               |

---

## 📝 Output Format (`stockData.json`)

```json
[
  {
    "symbol": "AAPL",
    "buySellIndicator": "B",
    "quantity": 100,
    "price": 17500,
    "packetSequence": 1
  },
  ...
]
```

---

## 🛠️ Development Notes
- You can customize `HOSTNAME` and `PORT` in `client.js`.
- Add CLI support or environment variable handling for better flexibility.
- Error handling is basic and could be expanded to include retries, logging, etc.

---

## 🧪 Testing Ideas
- Simulate missing packets on the server to test re-fetching logic.
- Unit test the parsing logic with mock `Buffer` inputs.
- Validate JSON output schema using a tool like [ajv](https://ajv.js.org/).

---

## 📚 Dependencies
Built-in Node.js modules only:
- `net`
- `fs`

No external dependencies are required.

---

```
