import {
  Bool,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  PrefixExpression,
  Program
} from "../ast/index";
import Token from "../token/index";

const LOWEST = 0;
const EQUALS = 1;
const LESSGREATER = 2;
const SUM = 3;
const PRODUCT = 4;
const PREFIX = 5;

const precedenceTable = new Map();
precedenceTable.set(Token.EQ, EQUALS);

export default class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.errors = [];

    this.currentToken = {};
    this.peekToken = {};

    this.prefixParseFunctions = new Map();
    this.prefixParseFunctions.set(Token.IDENTIFIER, this.parseIdentifier);
    this.prefixParseFunctions.set(Token.INT, this.parseIntegerLiteral);
    this.prefixParseFunctions.set(Token.TRUE, this.parseBoolean);
    this.prefixParseFunctions.set(Token.FALSE, this.parseBoolean);
    this.prefixParseFunctions.set(Token.BANG, this.parsePrefixExpression);
    this.prefixParseFunctions.set(Token.MINUS, this.parsePrefixExpression);

    this.nextToken(); // set current token
    this.nextToken(); // set peek token
  }

  parseProgram() {
    const program = new Program();

    while (!this.currentTokenIs(Token.EOF)) {
      const statement = this.parseStatement();
      if (statement) program.statements.push(statement);
      this.nextToken();
    }

    return program;
  }

  parseStatement() {
    return this.parseExpressionStatement();
  }

  parseExpression(precedence) {
    const prefix = this.prefixParseFunctions.get(this.currentToken.type);
    if (!prefix) {
      this.throwNoParseFunctionError(this.currentToken);
      return;
    }
    return prefix.apply(this);
  }

  parseExpressionStatement() {
    const expression = this.parseExpression();
    const statement = new ExpressionStatement(this.currentToken, expression);
    if (this.peekTokenIs(Token.SEMICOLON)) this.nextToken();

    return statement;
  }

  parseIdentifier() {
    return new Identifier(this.currentToken, this.currentToken.literal);
  }

  parseIntegerLiteral() {
    const value = Number(this.currentToken.literal);

    if (Number.isNaN(value)) {
      this.throwNotIntegerError(this.currentToken);
      return;
    }
    return new IntegerLiteral(this.currentToken, value);
  }

  parsePrefixExpression() {
    const token = this.currentToken;
    const operator = token.literal;
    this.nextToken();
    const rightExpression = this.parseExpression(PREFIX);
    return new PrefixExpression(token, operator, rightExpression);
  }

  parseBoolean() {
    return new Bool(this.currentToken, this.currentTokenIs(Token.TRUE));
  }

  nextToken() {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  currentTokenIs(token) {
    return this.currentToken.type === token;
  }

  peekTokenIs(token) {
    return this.peekToken.type === token;
  }

  expectToken(token) {
    if (this.peekTokenIs(token)) {
      this.nextToken();
      return true;
    } else {
      this.throwPeekError(token);
      return false;
    }
  }

  throwPeekError(token) {
    this.errors.push(
      `Expected next token to be ${token}, got ${this.currentToken.type}`
    );
  }

  throwNoParseFunctionError(token) {
    this.errors.push(`No prefix parse function for ${token.type} found`);
  }

  throwNotIntegerError(token) {
    this.errors.push(`Not an integer: ${token.type}`);
  }

  get Errors() {
    return this.errors;
  }
}
