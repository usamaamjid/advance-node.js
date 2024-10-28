const express = require("express");
const { Worker, workerData } = require("worker_threads");

const app = express();
const PORT = 3000;

app.get("/non-blocking", (req, res) => {
  res.status(200).send("this is non blocking api");
});


const THREAD_COUNT = 4;

function createWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./four-worker.js", {
      workerData: { thread_count: THREAD_COUNT }
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (error) => {
      reject(error);
    });
  });
}

// divide long running tasks into 4 threads
app.get("/blocking-four-worker", async (req, res) => {
  const workerPromises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }
  const thread_result = await Promise.all(workerPromises);
  const total = thread_result[0] + thread_result[1] + thread_result[2] + thread_result[3];
  res.status(200).send(`Result is ${total}`);
});

// running in single thread long running task
app.get("/blocking", async (req, res) => {
  const worker = new Worker("./worker.js");
  worker.on("message", (data) => {
    res.status(200).send(`Result is ${data}`);
  });
  worker.on("error", (error) => {
    res.status(400).send(`An error occured ${error}`);
  });
});

app.listen(PORT, () => {
  console.info(`App running on ${PORT} port`)
});