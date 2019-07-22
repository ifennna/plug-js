class Node {
  tokenLiteral() {}
  string() {}
}

class Statement extends Node {}

class Expression extends Node {
  constructor(token) {
    super();
    this.token = token;
  }
}

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

class LetStatement extends Statement {
  constructor(token, name, value) {
    super();
    this.token = token;
    this.name = name;
    this.value = value;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `${this.token.literal} ${this.name} = ${this.value};`;
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

class BlockStatement extends Statement {
  constructor(token, statements) {
    super();
    this.token = token;
    this.statements = statements;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    let string = "";
    this.statements.forEach(statement => (string += statement.string()));
    return string;
  }
}

class Identifier extends Expression {
  constructor(token, value) {
    super(token);
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
    super(token);
    this.value = value;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.value;
  }
}

class StringLiteral extends Expression {
  constructor(token, value) {
    super(token);
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
    super(token);
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
    super(token);
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
    super(token);
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

class IfExpression extends Expression {
  constructor(token, condition, consequence, alternative) {
    super(token);
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `if ${this.condition.string()} {${this.consequence.string()}}` +
      this.alternative
      ? `else {${this.alternative}}`
      : "";
  }
}

class FunctionLiteral extends Expression {
  constructor(token, parameters, body) {
    super(token);
    this.parameters = parameters;
    this.body = body;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `func (${this.parameters.join(", ")}) {
      ${this.body.string()}
    }`;
  }
}

export {
  Program,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  BlockStatement,
  Identifier,
  IntegerLiteral,
  StringLiteral,
  Bool,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  FunctionLiteral
};
