import { Scan } from "./scanner/index.js";

export const start = () => {
  let startTime;
  let endTime;

  startTime = performance.now();
  interpret();
  endTime = performance.now();

  console.log(endTime - startTime);
};

const interpret = () => {
  const text = document.getElementById("input").value;

  Scan(text);
};

const run = document.getElementById("runButton");
run.addEventListener("click", start);
