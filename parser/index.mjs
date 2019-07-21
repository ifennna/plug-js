import {
  Bool,
  ExpressionStatement,
  Identifier,
  InfixExpression,
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
precedenceTable.set(Token.NOT_EQ, EQUALS);
precedenceTable.set(Token.LT, LESSGREATER);
precedenceTable.set(Token.GT, LESSGREATER);
precedenceTable.set(Token.PLUS, SUM);
precedenceTable.set(Token.MINUS, SUM);
precedenceTable.set(Token.SLASH, PRODUCT);
precedenceTable.set(Token.ASTERISK, PRODUCT);

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

    this.infixParseFunctions = new Map();
    this.infixParseFunctions.set(Token.PLUS, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.MINUS, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.SLASH, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.ASTERISK, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.EQ, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.NOT_EQ, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.LT, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.GT, this.parseInfixExpression);

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

  parseExpressionStatement() {
    const expression = this.parseExpression(LOWEST);
    const statement = new ExpressionStatement(this.currentToken, expression);
    if (this.peekTokenIs(Token.SEMICOLON)) this.nextToken();

    return statement;
  }

  parseExpression(precedence) {
    const prefix = this.prefixParseFunctions.get(this.currentToken.type);
    if (!prefix) {
      this.throwNoParseFunctionError(this.currentToken);
      return;
    }
    let leftExpression = prefix.call(this);

    // move through line until we hit a lower precedence operator
    // then we return so the lower precedence operation occurs higher up in the tree
    while (
      !this.peekTokenIs(Token.SEMICOLON) &&
      precedence < this.peekPrecedence
    ) {
      const infix = this.infixParseFunctions.get(this.peekToken.type);
      if (!infix) return leftExpression;
      this.nextToken();
      leftExpression = infix.call(this, leftExpression);
    }

    return leftExpression;
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

  parseBoolean() {
    return new Bool(this.currentToken, this.currentTokenIs(Token.TRUE));
  }

  parsePrefixExpression() {
    const token = this.currentToken;
    const operator = token.literal;
    this.nextToken();
    const rightExpression = this.parseExpression(PREFIX);
    return new PrefixExpression(token, operator, rightExpression);
  }

  parseInfixExpression(left) {
    const precedence = this.currentPrecedence;
    const token = this.currentToken;
    const operator = token.literal;

    this.nextToken();

    const right = this.parseExpression(precedence);

    return new InfixExpression(token, left, operator, right);
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

  get peekPrecedence() {
    return precedenceTable.has(this.peekToken.type)
      ? precedenceTable.get(this.peekToken.type)
      : LOWEST;
  }

  get currentPrecedence() {
    return precedenceTable.has(this.currentToken.type)
      ? precedenceTable.get(this.currentToken.type)
      : LOWEST;
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
