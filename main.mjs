import fs from "fs";
import { Scan } from "./scanner/index";

fs.readFile(process.argv[2], (error, data) => {
  Scan(data.toString());
});
