import { describe, expect, it } from "../testHelpers";
import Lexer from "../lexer/index";
import Parser from "../parser/index";
import Eval from "./index";
import { Integer, Null, PlugBoolean } from "../object/index";
import { Environment } from "../object/environment";

const testEval = input => {
  const parser = new Parser(new Lexer(input));
  const program = parser.parseProgram();
  const env = new Environment();

  return Eval(program, env);
};

const testIntegerObject = (expected, evaluated) => {
  expect(evaluated).toImplement(Integer);
  expect(evaluated.value).toEqual(expected);
};

const testBooleanObject = (expected, evaluated) => {
  expect(evaluated).toImplement(PlugBoolean);
  expect(evaluated.value).toEqual(expected);
};

const testNullObject = evaluated => {
  expect(evaluated).toImplement(Null);
};

describe("Evaluator", () => {
  it("should evaluate integer expressions", () => {
    const testCases = [
      { input: "5", expected: 5 },
      { input: "-7", expected: -7 },
      { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
      { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
      { input: "-50 + 100 + -50", expected: 0 },
      { input: "5 * 2 + 10", expected: 20 },
      { input: "5 + 2 * 10", expected: 25 },
      { input: "20 + 2 * -10", expected: 0 },
      { input: "50 / 2 * 2 + 10", expected: 60 },
      { input: "2 * (5 + 10)", expected: 30 },
      { input: "3 * 3 * 3 + 10", expected: 37 },
      { input: "3 * (3 * 3) + 10", expected: 37 },
      { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 }
    ];

    testCases.forEach(testCase => {
      testIntegerObject(testCase.expected, testEval(testCase.input));
    });
  });

  it("should evaluate boolean expressions", () => {
    const testCases = [
      { input: "true", expected: true },
      { input: "false", expected: false },
      { input: "1 < 2", expected: true },
      { input: "1 > 2", expected: false },
      { input: "1 < 1", expected: false },
      { input: "1 > 1", expected: false },
      { input: "1 == 1", expected: true },
      { input: "1 != 1", expected: false },
      { input: "1 == 2", expected: false },
      { input: "1 != 2", expected: true },
      { input: "true == true", expected: true },
      { input: "false == false", expected: true },
      { input: "true == false", expected: false },
      { input: "true != false", expected: true },
      { input: "false != true", expected: true },
      { input: "(1 < 2) == true", expected: true },
      { input: "(1 < 2) == false", expected: false },
      { input: "(1 > 2) == true", expected: false },
      { input: "(1 > 2) == false", expected: true }
    ];

    testCases.forEach(testCase => {
      testBooleanObject(testCase.expected, testEval(testCase.input));
    });
  });

  it("should evaluate expressions with the bang operator", () => {
    const testCases = [
      { input: "!true", expected: false },
      { input: "!false", expected: true },
      { input: "!5", expected: false },
      { input: "!!true", expected: true },
      { input: "!!false", expected: false },
      { input: "!!5", expected: true }
    ];

    testCases.forEach(testCase => {
      testBooleanObject(testCase.expected, testEval(testCase.input));
    });
  });

  it("should evaluate if-else expressions", () => {
    const testCases = [
      { input: "if (true) { return 10 }", expected: 10 },
      { input: "if (false) { 10 }", expected: null },
      { input: "if (1) { 10 }", expected: 10 },
      { input: "if (1 < 2) { 10 }", expected: 10 },
      { input: "if (1 > 2) { 10 }", expected: null },
      { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
      { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 }
    ];

    testCases.forEach(testCase => {
      const evaluated = testEval(testCase.input);
      typeof testCase.expected === "number"
        ? testIntegerObject(testCase.expected, evaluated)
        : testNullObject(evaluated);
    });
  });

  it("should evaluate return statements", () => {
    const testCases = [
      { input: "return 10;", expected: 10 },
      { input: "return 10; 9;", expected: 10 },
      { input: "return 2 * 5; 9;", expected: 10 },
      { input: "9; return 10; 9;", expected: 10 },
      {
        input: `if (10 > 1) {
					if (10 > 1) {
						return 10;
					}
					return 1;
				}`,
        expected: 10
      }
    ];

    testCases.forEach(testCase => {
      testIntegerObject(testCase.expected, testEval(testCase.input));
    });
  });

  it("should evaluate let statements", () => {
    const testCases = [
      { input: "let a = 5; a;", expected: 5 },
      { input: "let a = 5 * 5; a;", expected: 25 },
      { input: "let a = 5; let b = a; b;", expected: 5 },
      { input: "let a = 5; let b = a; let c = b + a + 5; c;", expected: 15 }
    ];

    testCases.forEach(testCase => {
      testIntegerObject(testCase.expected, testEval(testCase.input));
    });
  });
});
