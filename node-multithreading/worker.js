const { parentPort } = require("worker_threads");

let count = 0;
for (let i = 0; i < 20_00_00_00_000; i++) {
  count++;
}

parentPort.postMessage(count);