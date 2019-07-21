import Parser from "./";
import Lexer from "../lexer";
import { describe, it, expect } from "../testHelpers";
import {
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  Bool,
  PrefixExpression,
  InfixExpression
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
      }
      // {
      //   input: "a + add(b * c) + d",
      //   expected: "((a + add((b * c))) + d)"
      // },
      // {
      //   input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
      //   expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))"
      // },
      // {
      //   input: "add(a + b + c * d / f + g)",
      //   expected: "add((((a + b) + ((c * d) / f)) + g))"
      // },
      // {
      //   input: "a * [1, 2, 3, 4][b * c] * d",
      //   expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)"
      // },
      // {
      //   input: "add(a * b[2], b[1], 2 * [1, 2][1])",
      //   expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))"
      // }
    ];

    testCases.forEach(testCase => {
      const program = setup(testCase.input);
      expect(program.string()).toEqual(testCase.expected);
    });
  });
});
