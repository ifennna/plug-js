import { Scan } from "./scanner/index.js";

export const start = () => {
  interpret();
};

const interpret = () => {
  const text = document.getElementById("input").value;
  const writer = new Writer();

  const startTime = performance.now();
  Scan(text, writer);
  const endTime = performance.now();

  writer.write(`Time elapsed: ${endTime - startTime}`);

  document.getElementById("output").value = writer.string;
};

const run = document.getElementById("runButton");
run.addEventListener("click", start);

class Writer {
  constructor() {
    this.string = "";
  }

  write(string) {
    this.string += string + "\n";
  }
}
