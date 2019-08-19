import { describe, expect, it } from "../testHelpers";
import Lexer from "../lexer/index";
import Parser from "../parser/index";
import Eval from "./index";
import { Integer } from "../object/index";

const testEval = input => {
  let parser = new Parser(new Lexer(input));
  let program = parser.parseProgram();

  return Eval(program);
};

const testIntegerObject = (expected, evaluated) => {
  expect(evaluated).toImplement(Integer);
  expect(evaluated.value).toEqual(expected);
};

describe("Evaluator", () => {
  it("should evaluate integer expressions", () => {
    const testCases = [
      { input: "5", expected: 5 },
      { input: "-7", expected: -7 }
    ];

    testCases.forEach(testCase => {
      testIntegerObject(testCase.expected, testEval(testCase.input));
    });
  });
});
