import Parser from "./";
import Lexer from "../lexer";
import { describe, it, expect } from "../testHelpers";
import {
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  Bool,
  PrefixExpression,
  InfixExpression,
  ReturnStatement,
  LetStatement,
  IfExpression,
  StringLiteral,
  FunctionLiteral,
  CallExpression,
  ArrayLiteral,
  IndexExpression
} from "../ast/index";

const setup = input => {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  checkParserErrors(parser);
  return program;
};

const checkParserErrors = parser => {
  const errors = parser.Errors;
  if (errors.length === 0) return;

  console.log(`Parser has ${errors.length} errors`);
  errors.forEach(error => console.log(error));
  throw new Error("Stopped");
};

const getStatement = program => {
  const statement = program.statements[0];
  expect(statement).toImplement(ExpressionStatement);
  return statement;
};

const testIdentifier = (expression, expected) => {
  expect(expression).toImplement(Identifier);
  expect(expression.value).toEqual(expected);
  expect(expression.tokenLiteral()).toEqual(expected);
  return true;
};

const testIntegerLiteral = (expression, expected) => {
  expect(expression).toImplement(IntegerLiteral);
  expect(expression.value).toEqual(expected);
  expect(expression.tokenLiteral()).toEqual(expected.toString());
  return true;
};

const testBoolean = (expression, expected) => {
  expect(expression).toImplement(Bool);
  expect(expression.value).toEqual(expected);
  expect(expression.tokenLiteral()).toEqual(`${expected}`);
  return true;
};

const testLiteralExpression = (expression, expected) => {
  switch (typeof expected) {
    case "string":
      return testIdentifier(expression, expected);
    case "number":
      return testIntegerLiteral(expression, expected);
    case "boolean":
      return testBoolean(expression, expected);
  }
  return false;
};

const testInfixExpression = (expression, left, operator, right) => {
  expect(expression).toImplement(InfixExpression);
  expect(testLiteralExpression(expression.left, left)).toEqual(true);
  expect(expression.operator).toEqual(operator);
  expect(testLiteralExpression(expression.right, right)).toEqual(true);
  return true;
};

describe("Parser", () => {
  it("should parse identifier expressions", () => {
    const input = "foobar;";
    const program = setup(input);

    expect(program.statements.length).toEqual(1);
    const statement = getStatement(program);
    expect(testIdentifier(statement.expression, "foobar")).toEqual(true);
  });

  it("should parse integer literals", () => {
    const input = "5;";
    const program = setup(input);

    expect(program.statements.length).toEqual(1);
    const statement = getStatement(program);
    expect(testIntegerLiteral(statement.expression, 5)).toEqual(true);
  });

  it("should parse boolean expressions", () => {
    const input = "true";
    const program = setup(input);

    expect(program.statements.length).toEqual(1);
    const statement = getStatement(program);
    expect(testBoolean(statement.expression, true)).toEqual(true);
  });

  it("should parse string literals", () => {
    const input = `"hello world"`;
    const program = setup(input);
    const statement = getStatement(program);
    const literal = statement.expression;

    expect(literal).toImplement(StringLiteral);
    expect(literal.value).toEqual("hello world");
  });

  it("should parse prefix expressions", () => {
    const testCases = [
      { input: "!5", operator: "!", value: 5 },
      { input: "-15", operator: "-", value: 15 },
      { input: "!false", operator: "!", value: false },
      { input: "!true", operator: "!", value: true }
    ];

    testCases.forEach(testCase => {
      const program = setup(testCase.input);
      expect(program.statements.length).toEqual(1);
      const statement = getStatement(program);
      const expression = statement.expression;

      expect(expression).toImplement(PrefixExpression);
      expect(expression.operator).toEqual(testCase.operator);
      expect(testLiteralExpression(expression.right, testCase.value)).toEqual(
        true
      );
    });
  });

  it("should parse infix expressions", () => {
    const testCases = [
      { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
      { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
      { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
      { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
      { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
      { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
      { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
      { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 }
    ];

    testCases.forEach(testCase => {
      const program = setup(testCase.input);
      expect(program.statements.length).toEqual(1);
      const statement = getStatement(program);
      expect(
        testInfixExpression(
          statement.expression,
          testCase.leftValue,
          testCase.operator,
          testCase.rightValue
        )
      ).toEqual(true);
    });
  });

  it("should parse return statements", () => {
    const testCases = [
      { input: "return 5;", expectedValue: 5 },
      { input: "return true;", expectedValue: true },
      { input: "return foobar;", expectedValue: "foobar" }
    ];

    testCases.forEach(testCase => {
      const program = setup(testCase.input);
      expect(program.statements.length).toEqual(1);
      const statement = program.statements[0];

      expect(statement).toImplement(ReturnStatement);
      expect(statement.tokenLiteral()).toEqual("return");
      expect(
        testLiteralExpression(statement.returnValue, testCase.expectedValue)
      ).toEqual(true);
    });
  });

  it("should parse let statements", () => {
    const testCases = [
      { input: "let x = 5", expectedIdentifier: "x", expectedValue: 5 },
      { input: "let y = true", expectedIdentifier: "y", expectedValue: true },
      { input: "let foo = y", expectedIdentifier: "foo", expectedValue: "y" }
    ];

    testCases.forEach(testCase => {
      const program = setup(testCase.input);
      expect(program.statements.length).toEqual(1);
      const statement = program.statements[0];

      expect(statement).toImplement(LetStatement);
      expect(statement.name.value).toEqual(testCase.expectedIdentifier);
      expect(statement.value.value).toEqual(testCase.expectedValue);
    });
  });

  it("should parse 'if' expressions", () => {
    const input = "if (x > y) { x }";
    const program = setup(input);
    expect(program.statements.length).toEqual(1);
    const statement = getStatement(program);

    const expression = statement.expression;
    expect(expression).toImplement(IfExpression);

    expect(testInfixExpression(expression.condition, "x", ">", "y")).toEqual(
      true
    );
    expect(expression.consequence.statements.length).toEqual(1);
    const consequence = expression.consequence.statements[0];
    expect(consequence).toImplement(ExpressionStatement);
    expect(testIdentifier(consequence.expression, "x")).toEqual(true);
    expect(consequence.alternative).toEqual(undefined);
  });

  it("should parse 'if-else' expressions", () => {
    const input = "if (x < y) { x } else { y }";
    const program = setup(input);
    expect(program.statements.length).toEqual(1);
    const statement = getStatement(program);

    const expression = statement.expression;
    expect(expression).toImplement(IfExpression);

    expect(testInfixExpression(expression.condition, "x", "<", "y")).toEqual(
      true
    );
    expect(expression.consequence.statements.length).toEqual(1);
    const consequence = expression.consequence.statements[0];
    expect(consequence).toImplement(ExpressionStatement);
    expect(testIdentifier(consequence.expression, "x")).toEqual(true);

    expect(expression.alternative.statements.length).toEqual(1);
    const alternative = expression.alternative.statements[0];
    expect(alternative).toImplement(ExpressionStatement);
    expect(testIdentifier(alternative.expression, "y")).toEqual(true);
  });

  it("should parse function literals", () => {
    const input = "func(a, b) { a * b; }";
    const program = setup(input);
    const statement = getStatement(program);
    const func = statement.expression;

    expect(func).toImplement(FunctionLiteral);
    expect(func.parameters.length).toEqual(2);
    testLiteralExpression(func.parameters[0], "a");
    testLiteralExpression(func.parameters[1], "b");

    expect(func.body.statements.length).toEqual(1);
    const body = func.body.statements[0];
    expect(body).toImplement(ExpressionStatement);
    testInfixExpression(body.expression, "a", "*", "b");
  });

  it("should parse call expressions", () => {
    const input = "add(1, 2*3, 3+4)";
    const program = setup(input);
    const statement = getStatement(program);
    const expression = statement.expression;

    expect(expression).toImplement(CallExpression);
    testIdentifier(expression.func, "add");
    expect(expression.callArguments.length).toEqual(3);

    testLiteralExpression(expression.callArguments[0], 1);
    testInfixExpression(expression.callArguments[1], 2, "*", 3);
    testInfixExpression(expression.callArguments[2], 3, "+", 4);
  });

  it("should parse array literals", () => {
    const input = "[1, 2*3, 3+4]";
    const program = setup(input);
    const statement = getStatement(program);
    const expression = statement.expression;

    expect(expression).toImplement(ArrayLiteral);
    expect(expression.elements.length).toEqual(3);

    testLiteralExpression(expression.elements[0], 1);
    testInfixExpression(expression.elements[1], 2, "*", 3);
    testInfixExpression(expression.elements[2], 3, "+", 4);
  });

  it("should parse array indexes", () => {
    const input = "myArray[1 + 1]";
    const program = setup(input);
    const statement = getStatement(program);
    const expression = statement.expression;

    expect(expression).toImplement(IndexExpression);

    testIdentifier(expression.left, "myArray");
    testInfixExpression(expression.index, 1, "+", 1);
  });
});

describe("Parser checks", () => {
  it("should parse operators with respect to their precedence", () => {
    const testCases = [
      {
        input: "-a * b",
        expected: "((-a) * b)"
      },
      {
        input: "!-a",
        expected: "(!(-a))"
      },
      {
        input: "a + b + c",
        expected: "((a + b) + c)"
      },
      {
        input: "a + b - c",
        expected: "((a + b) - c)"
      },
      {
        input: "a * b * c",
        expected: "((a * b) * c)"
      },
      {
        input: "a * b / c",
        expected: "((a * b) / c)"
      },
      {
        input: "a + b / c",
        expected: "(a + (b / c))"
      },
      {
        input: "a + b * c + d / e - f",
        expected: "(((a + (b * c)) + (d / e)) - f)"
      },
      {
        input: "3 + 4; -5 * 5",
        expected: "(3 + 4)((-5) * 5)"
      },
      {
        input: "5 > 4 == 3 < 4",
        expected: "((5 > 4) == (3 < 4))"
      },
      {
        input: "5 < 4 != 3 > 4",
        expected: "((5 < 4) != (3 > 4))"
      },
      {
        input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
        expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"
      },
      {
        input: "true",
        expected: "true"
      },
      {
        input: "false",
        expected: "false"
      },
      {
        input: "3 > 5 == false",
        expected: "((3 > 5) == false)"
      },
      {
        input: "3 < 5 == true",
        expected: "((3 < 5) == true)"
      },
      {
        input: "1 + (2 + 3) + 4",
        expected: "((1 + (2 + 3)) + 4)"
      },
      {
        input: "(5 + 5) * 2",
        expected: "((5 + 5) * 2)"
      },
      {
        input: "2 / (5 + 5)",
        expected: "(2 / (5 + 5))"
      },
      {
        input: "(5 + 5) * 2 * (5 + 5)",
        expected: "(((5 + 5) * 2) * (5 + 5))"
      },
      {
        input: "-(5 + 5)",
        expected: "(-(5 + 5))"
      },
      {
        input: "!(true == true)",
        expected: "(!(true == true))"
      },
      {
        input: "a + add(b * c) + d",
        expected: "((a + add((b * c))) + d)"
      },
      {
        input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
        expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))"
      },
      {
        input: "add(a + b + c * d / f + g)",
        expected: "add((((a + b) + ((c * d) / f)) + g))"
      },
      {
        input: "a * [1, 2, 3, 4][b * c] * d",
        expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)"
      },
      {
        input: "add(a * b[2], b[1], 2 * [1, 2][1])",
        expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))"
      }
    ];

    testCases.forEach(testCase => {
      const program = setup(testCase.input);
      expect(program.string()).toEqual(testCase.expected);
    });
  });
});
