import {
  ArrayLiteral,
  BlockStatement,
  Bool,
  CallExpression,
  ExpressionStatement,
  ForStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  StringLiteral
} from "../ast/index.js";
import Token from "../token/index.js";

const LOWEST = 0;
const EQUALS = 1;
const LESSGREATER = 2;
const SUM = 3;
const PRODUCT = 4;
const PREFIX = 5;
const CALL = 6;
const INDEX = 7;

const precedenceTable = new Map();
precedenceTable.set(Token.EQ, EQUALS);
precedenceTable.set(Token.NOT_EQ, EQUALS);
precedenceTable.set(Token.LT, LESSGREATER);
precedenceTable.set(Token.GT, LESSGREATER);
precedenceTable.set(Token.PLUS, SUM);
precedenceTable.set(Token.MINUS, SUM);
precedenceTable.set(Token.SLASH, PRODUCT);
precedenceTable.set(Token.ASTERISK, PRODUCT);
precedenceTable.set(Token.LPAREN, CALL);
precedenceTable.set(Token.LBRACKET, INDEX);

export default class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.errors = [];

    this.currentToken = {};
    this.peekToken = {};

    this.prefixParseFunctions = new Map();
    this.prefixParseFunctions.set(Token.IDENTIFIER, this.parseIdentifier);
    this.prefixParseFunctions.set(Token.INT, this.parseIntegerLiteral);
    this.prefixParseFunctions.set(Token.STRING, this.parseStringLiteral);
    this.prefixParseFunctions.set(Token.TRUE, this.parseBoolean);
    this.prefixParseFunctions.set(Token.FALSE, this.parseBoolean);
    this.prefixParseFunctions.set(Token.LPAREN, this.parseGroupedExpression);
    this.prefixParseFunctions.set(Token.BANG, this.parsePrefixExpression);
    this.prefixParseFunctions.set(Token.MINUS, this.parsePrefixExpression);
    this.prefixParseFunctions.set(Token.IF, this.parseIfExpression);
    this.prefixParseFunctions.set(Token.FUNCTION, this.parseFunctionLiteral);
    this.prefixParseFunctions.set(Token.LBRACKET, this.parseArrayLiteral);

    this.infixParseFunctions = new Map();
    this.infixParseFunctions.set(Token.PLUS, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.MINUS, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.SLASH, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.ASTERISK, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.EQ, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.NOT_EQ, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.LT, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.GT, this.parseInfixExpression);
    this.infixParseFunctions.set(Token.LPAREN, this.parseCallExpression);
    this.infixParseFunctions.set(Token.LBRACKET, this.parseIndexExpression);

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
    switch (this.currentToken.type) {
      case Token.LET:
        return this.parseLetStatement();
      case Token.RETURN:
        return this.parseReturnStatement();
      case Token.FOR:
        return this.parseForLoop();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement() {
    const token = this.currentToken;
    if (!this.expectPeek(Token.IDENTIFIER)) {
      this.throwPeekError(Token.IDENTIFIER);
      return;
    }

    const name = new Identifier(this.currentToken, this.currentToken.literal);

    if (!this.expectPeek(Token.ASSIGN)) {
      this.throwPeekError(Token.ASSIGN);
      return;
    }

    this.nextToken();
    const value = this.parseExpression(LOWEST);

    if (this.peekTokenIs(Token.SEMICOLON)) {
      this.nextToken();
    }

    return new LetStatement(token, name, value);
  }

  parseReturnStatement() {
    const token = this.currentToken;
    this.nextToken();
    const returnValue = this.parseExpression(LOWEST);
    if (this.peekTokenIs(Token.SEMICOLON)) this.nextToken();

    return new ReturnStatement(token, returnValue);
  }

  parseForLoop() {
    const token = this.currentToken;
    this.nextToken();

    const index = new Identifier(this.currentToken, this.currentToken.literal);
    if (!this.expectPeek(Token.ASSIGN)) {
      this.throwPeekError(Token.ASSIGN);
      return;
    }
    this.nextToken();

    const range = this.parseExpression(LOWEST);

    if (!this.expectPeek(Token.LBRACE)) {
      this.throwPeekError(Token.LBRACE);
      return;
    }

    const body = this.parseBlockStatement();

    return new ForStatement(token, index, range, body);
  }

  parseExpressionStatement() {
    const expression = this.parseExpression(LOWEST);
    const statement = new ExpressionStatement(this.currentToken, expression);
    if (this.peekTokenIs(Token.SEMICOLON)) this.nextToken();

    return statement;
  }

  parseBlockStatement() {
    const token = this.currentToken;
    const statements = [];

    this.nextToken();

    while (
      !this.currentTokenIs(Token.RBRACE) &&
      !this.currentTokenIs(Token.EOF)
    ) {
      const statement = this.parseStatement();
      if (statement) statements.push(statement);
      this.nextToken();
    }

    return new BlockStatement(token, statements);
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

  parseStringLiteral() {
    return new StringLiteral(this.currentToken, this.currentToken.literal);
  }

  parseBoolean() {
    return new Bool(this.currentToken, this.currentTokenIs(Token.TRUE));
  }

  parseGroupedExpression() {
    this.nextToken();
    const expression = this.parseExpression(LOWEST);
    if (!this.expectPeek(Token.RPAREN)) {
      this.throwPeekError(Token.RPAREN);
      return;
    }
    return expression;
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

  parseIfExpression() {
    const token = this.currentToken;
    if (!this.expectPeek(Token.LPAREN)) {
      this.throwPeekError(Token.LPAREN);
      return;
    }

    this.nextToken();
    const condition = this.parseExpression(LOWEST);

    if (!this.expectPeek(Token.RPAREN)) {
      this.throwPeekError(Token.RPAREN);
      return;
    }
    if (!this.expectPeek(Token.LBRACE)) {
      this.throwPeekError(Token.LBRACE);
      return;
    }

    const consequence = this.parseBlockStatement();
    let alternative;

    if (this.peekTokenIs(Token.ELSE)) {
      this.nextToken();
      if (!this.expectPeek(Token.LBRACE)) {
        this.throwPeekError(Token.LBRACE);
        return;
      }
      alternative = this.parseBlockStatement();
    }

    return new IfExpression(token, condition, consequence, alternative);
  }

  parseFunctionLiteral() {
    const token = this.currentToken;

    if (!this.expectPeek(Token.LPAREN)) {
      this.throwPeekError(Token.LPAREN);
      return;
    }
    const parameters = this.parseFunctionParameters();

    if (!this.expectPeek(Token.LBRACE)) {
      this.throwPeekError(Token.LBRACE);
      return;
    }

    const body = this.parseBlockStatement();

    return new FunctionLiteral(token, parameters, body);
  }

  parseFunctionParameters() {
    let identifiers = [];

    if (this.peekTokenIs(Token.RPAREN)) {
      this.nextToken();
      return identifiers;
    }
    this.nextToken();

    let identifier = new Identifier(
      this.currentToken,
      this.currentToken.literal
    );
    identifiers.push(identifier);

    while (this.peekTokenIs(Token.COMMA)) {
      this.nextToken(); // move to the comma
      this.nextToken(); // move to the next parameter

      let identifier = new Identifier(
        this.currentToken,
        this.currentToken.literal
      );
      identifiers.push(identifier);
    }

    if (!this.expectPeek(Token.RPAREN)) {
      this.throwPeekError(Token.RPAREN);
      return;
    }

    return identifiers;
  }

  parseCallExpression(func) {
    const callArguments = this.parseExpressionList(Token.RPAREN);
    return new CallExpression(this.currentToken, func, callArguments);
  }

  parseExpressionList(endToken) {
    //debugger;
    let list = [];
    if (this.peekTokenIs(endToken)) {
      this.nextToken();
      return list;
    }
    this.nextToken();
    list.push(this.parseExpression(LOWEST));

    while (this.peekTokenIs(Token.COMMA)) {
      this.nextToken(); // move to the comma
      this.nextToken(); // move to the next element
      list.push(this.parseExpression(LOWEST));
    }

    if (!this.expectPeek(endToken)) {
      this.throwPeekError(Token.RPAREN);
      return;
    }

    return list;
  }

  parseArrayLiteral() {
    const elements = this.parseExpressionList(Token.RBRACKET);
    return new ArrayLiteral(this.currentToken, elements);
  }

  parseIndexExpression(left) {
    const token = this.currentToken;
    this.nextToken();
    const index = this.parseExpression(LOWEST);

    if (!this.expectPeek(Token.RBRACKET)) {
      this.throwPeekError(Token.RPAREN);
      return;
    }

    return new IndexExpression(token, left, index);
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

  expectPeek(token) {
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
