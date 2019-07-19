import Lexer from "../lexer";
import {
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  Program
} from "../ast/index";
import Token from "../token/index";

const LOWEST = 0;
const EQUALS = 1;

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

  parseExpression() {
    const prefix = this.prefixParseFunctions.get(this.currentToken.type);
    if (!prefix) {
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
      // throw error
      return;
    }
    return new IntegerLiteral(this.currentToken, value);
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
      // throw error
      return false;
    }
  }
}
