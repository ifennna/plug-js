import { describe, expect, it } from "../testHelpers";
import Lexer from "../lexer/index";
import Parser from "../parser/index";
import Eval from "./index";
import {
  Integer,
  Null,
  PlugArray,
  PlugBoolean,
  PlugError,
  PlugFunction,
  PlugString
} from "../object/index";
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

const testErrorObject = (expected, evaluated) => {
  expect(evaluated).toImplement(PlugError);
  expect(evaluated.message).toEqual(expected);
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

  it("should evaluate string literals", () => {
    const input = `"Hello World!"`;
    const evaluated = testEval(input);

    expect(evaluated).toImplement(PlugString);
    expect(evaluated.value).toEqual("Hello World!");
  });

  it("should evaluate string concatenation", () => {
    const input = `"Hello" + " " + "World!"`;
    const evaluated = testEval(input);

    expect(evaluated).toImplement(PlugString);
    expect(evaluated.value).toEqual("Hello World!");
  });

  it("should evaluate array literals", () => {
    const input = "[1, 2 * 3, 4 + 5]";
    const evaluated = testEval(input);

    expect(evaluated).toImplement(PlugArray);
    expect(evaluated.elements.length).toEqual(3);

    testIntegerObject(1, evaluated.elements[0]);
    testIntegerObject(6, evaluated.elements[1]);
    testIntegerObject(9, evaluated.elements[2]);
  });

  it("should evaluate array index expressions", () => {
    const testCases = [
      { input: "[1, 2, 3][0]", expected: 1 },
      { input: "[1, 2, 3][1]", expected: 2 },
      { input: "[1, 2, 3][2]", expected: 3 },
      { input: "let i = 0; [1][i];", expected: 1 },
      { input: "[1, 2, 3][1 + 1];", expected: 3 },
      { input: "let myArray = [1, 2, 3]; myArray[2];", expected: 3 },
      {
        input: "let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];",
        expected: 6
      },
      {
        input: "let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]",
        expected: 2
      },
      { input: "[1, 2, 3][3]", expected: "Array index out of bounds" },
      { input: "[1, 2, 3][-1]", expected: "Array index out of bounds" }
    ];

    testCases.forEach(testCase => {
      const evaluated = testEval(testCase.input);
      typeof testCase.expected === "number"
        ? testIntegerObject(testCase.expected, evaluated)
        : testErrorObject(testCase.expected, evaluated);
    });
  });

  it("should evaluate function declarations", () => {
    const input = "func(x) {return x + 2;}";
    const evaluated = testEval(input);

    expect(evaluated).toImplement(PlugFunction);
    expect(evaluated.parameters.length).toEqual(1);
    expect(evaluated.parameters[0].string()).toEqual("x");
    expect(evaluated.body.string()).toEqual("return (x + 2);");
  });

  it("should evaluate call expressions", () => {
    const testCases = [
      { input: "let identity = func(x) { x; }; identity(5);", expected: 5 },
      {
        input: "let identity = func(x) { return x; }; identity(5);",
        expected: 5
      },
      { input: "let double = func(x) { x * 2; }; double(5);", expected: 10 },
      { input: "let add = func(x, y) { x + y; }; add(5, 5);", expected: 10 },
      {
        input: "let add = func(x, y) { x + y; }; add(5 + 5, add(5, 5));",
        expected: 20
      },
      { input: "func(x) { x; }(5)", expected: 5 }
    ];

    testCases.forEach(testCase => {
      testIntegerObject(testCase.expected, testEval(testCase.input));
    });
  });

  it("should evaluate builtin functions", () => {
    const testCases = [
      { input: `len("")`, expected: 0 },
      { input: `len("four")`, expected: 4 },
      { input: `len("hello world")`, expected: 11 },
      { input: `len([])`, expected: 0 },
      { input: `len([3, 9, 5])`, expected: 3 },
      {
        input: `len(1)`,
        expected: "Argument to 'len' not supported, got INTEGER"
      },
      {
        input: `len("one", "train")`,
        expected: "Invalid number of arguments to 'len', expected 1, got 2"
      },
      { input: `first([])`, expected: null },
      { input: `first([3, 9, 5])`, expected: 3 },
      { input: `last([])`, expected: null },
      { input: `last([3, 9, 5])`, expected: 5 },
      { input: `rest([3, 9, 5])`, expected: null },
      { input: `rest([3, 9, 5])`, expected: [9, 5] },
      { input: `push([3, 9, 5], 6)`, expected: [3, 9, 5, 6] },
      { input: `push([], 1)`, expected: [1] },
      {
        input: `push("b", "a")`,
        expected:
          "First argument to 'push' not supported, expected ARRAY, got STRING"
      }
    ];

    testCases.forEach(testCase => {
      const evaluated = testEval(testCase.input);
      switch (typeof testCase.expected) {
        case "number":
          testIntegerObject(testCase.expected, evaluated);
          break;
        case "string":
          testErrorObject(testCase.expected, evaluated);
          break;
        case testCase.expected instanceof Array === true:
          expect(evaluated).toImplement(PlugArray);
          testCase.expected.forEach((element, index) => {
            testIntegerObject(element, evaluated.elements[index]);
          });
      }
    });
  });
});
