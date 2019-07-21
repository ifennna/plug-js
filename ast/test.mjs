import { Program } from "./";
import { describe, it, expect } from "../testHelpers";

describe("AST", () => {
  it("should correctly build a parse tree", () => {
    const program = new Program();
    expect(program.string()).toEqual("");
  });
});
