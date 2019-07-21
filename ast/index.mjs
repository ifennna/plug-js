class Node {
  tokenLiteral() {}
  string() {}
}

class Statement extends Node {}

class Expression extends Node {}

class Program extends Node {
  constructor() {
    super();
    this.statements = [];
  }
  tokenLiteral() {
    return this.statements.length > 0 ? this.statements[0].tokenLiteral() : "";
  }
  string() {}
}

class LetStatement extends Statement {
  constructor(token, identifier, value) {
    super();
    this.token = token;
    this.identifier = identifier;
    this.value = value;
  }

  tokenLiteral() {
    return this.token.literal;
  }
}

class ExpressionStatement extends Statement {
  constructor(token, expression) {
    super();
    this.token = token;
    this.expression = expression;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.expression ? this.expression.string() : "";
  }
}

class Identifier extends Expression {
  constructor(token, value) {
    super();
    this.token = token;
    this.value = value;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.value;
  }
}

class IntegerLiteral extends Expression {
  constructor(token, value) {
    super();
    this.token = token;
    this.value = value;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.value;
  }
}

class Bool extends Expression {
  constructor(token, value) {
    super();
    this.token = token;
    this.value = value;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.value;
  }
}

class PrefixExpression extends Expression {
  constructor(token, operator, rightExpression) {
    super();
    this.token = token;
    this.operator = operator;
    this.right = rightExpression;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `(${this.operator}${this.right.string()})`;
  }
}

class InfixExpression extends Expression {
  constructor(token, leftExpression, operator, rightExpression) {
    super();
    this.token = token;
    this.left = leftExpression;
    this.operator = operator;
    this.right = rightExpression;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `(${this.left.string()}${this.operator}${this.right.string()})`;
  }
}

export {
  Program,
  LetStatement,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  Bool,
  PrefixExpression,
  InfixExpression
};
