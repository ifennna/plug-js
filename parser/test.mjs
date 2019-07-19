import Parser from "./";
import Lexer from "../lexer";
import { describe, it, expect } from "../testHelpers";
import { ExpressionStatement, Identifier, IntegerLiteral } from "../ast/index";

const setup = input => {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  return program;
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
  debugger;
  expect(expression.tokenLiteral()).toEqual(expected.toString());
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
});
