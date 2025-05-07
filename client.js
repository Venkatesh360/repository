const net = require('net');
const fs = require('fs');

const HOSTNAME = 'localhost';
const PORT = 3000;

const STATUS = {
  FETCHING: 'FETCHING',
  FETCHED: 'FETCHED',
};

let expectedSequence = 1;
let missedSequences = [];
let missedSequenceState;
let stockData = [];

const clientSocket = new net.Socket();

function writeToFile(filename, data) {
  fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
    if (err) return console.error(`Write error: ${err}`);
    console.log(`Data written to ${filename}`);
  });
}

function sendRequest(callType, sequence = 0) {
  const payload = Buffer.alloc(2);
  payload.writeUInt8(callType, 0);
  payload.writeUInt8(sequence, 1);
  clientSocket.write(payload);
}

function connectToServer(callback) {
  clientSocket.connect(PORT, HOSTNAME, () => {
    console.log(`Connected to ${HOSTNAME}:${PORT}`);
    if (callback) callback();
  });
}

function disconnectFromServer() {
  clientSocket.end();
}

function fetchAllPackets() {
  connectToServer(() => {
    console.log('Requesting all packets...');
    sendRequest(1);
  });
}

function fetchMissingPackets() {
  connectToServer(() => {
    console.log(`Fetching missing packets: ${missedSequences}`);
    while (missedSequences.length > 0) {
      const seq = missedSequences.pop();
      sendRequest(2, seq);
    }
    disconnectFromServer();
  });
}

function hasMissingPackets() {
  return missedSequences.length > 0;
}

function parsePacketData(data) {
  const PACKET_SIZE = 17;

  for (let i = 0; i < data.length; i += PACKET_SIZE) {
    const packet = data.slice(i, i + PACKET_SIZE);

    const parsed = {
      symbol: packet.toString('ascii', 0, 4),
      buySellIndicator: packet.toString('ascii', 4, 5),
      quantity: packet.readUInt32BE(5),
      price: packet.readUInt32BE(9),
      packetSequence: packet.readUInt32BE(13),
    };

    const seq = parsed.packetSequence;

    if (seq !== expectedSequence) {
      for (let j = expectedSequence; j < seq; j++) {
        missedSequences.push(j);
        stockData[j - 1] = j; 
      }
    }

    if (missedSequenceState === STATUS.FETCHING) {
      stockData[seq - 1] = parsed;
    } else {
      stockData.push(parsed);
    }

    expectedSequence = seq + 1;
  }
}

clientSocket.on('data', parsePacketData);

clientSocket.on('error', (err) => {
  console.error(`Socket error: ${err.message}`);
});

clientSocket.on('close', () => {
  console.log('Connection closed');
  if (hasMissingPackets()) {
    missedSequenceState = STATUS.FETCHING;
    fetchMissingPackets();
  } else {
    missedSequenceState = STATUS.FETCHED;
    writeToFile('stockData.json', stockData);
  }
});

fetchAllPackets();
