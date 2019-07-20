import Parser from "./";
import Lexer from "../lexer";
import { describe, it, expect } from "../testHelpers";
import {
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  Bool,
  PrefixExpression
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
    debugger;
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
});
