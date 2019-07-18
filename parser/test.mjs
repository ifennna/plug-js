import Parser from "./";
import Lexer from "../lexer";
import { describe, it, expect } from "../testHelpers";
import { ExpressionStatement, Identifier } from "../ast/index";

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

describe("Parser", () => {
  it("should parse identifier expressions", () => {
    const input = "foobar;";
    const program = setup(input);

    expect(program.statements.length).toEqual(1);
    const statement = getStatement(program);
    expect(testIdentifier(statement.expression, "foobar")).toEqual(true);
  });
});
