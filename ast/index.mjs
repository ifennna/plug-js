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
  string() {
    let string = "";
    this.statements.forEach(statement => (string += statement.string()));
    return string;
  }
}

class ReturnStatement extends Statement {
  constructor(token, returnValue) {
    super();
    this.token = token;
    this.returnValue = returnValue;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `${this.token.literal} ${this.returnValue};`;
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
    return `(${this.left.string()} ${this.operator} ${this.right.string()})`;
  }
}

export {
  Program,
  ReturnStatement,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  Bool,
  PrefixExpression,
  InfixExpression
};
