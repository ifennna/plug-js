class Node {
  constructor(token) {
    this.token = token;
  }

  tokenLiteral() {}
  string() {}
}

class Statement extends Node {
  constructor(token) {
    super(token);
  }
}

class Expression extends Node {
  constructor(token) {
    super(token);
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
    super(token);
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
    super(token);
    this.returnValue = returnValue;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `${this.token.literal} ${this.returnValue};`;
  }
}

class ForStatement extends Statement {
  constructor(token, index, range, body) {
    super(token);
    this.index = index;
    this.range = range;
    this.body = body;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `${this.tokenLiteral()} ${this.index.string()} in ${this.range.string()} {${this.body.string()}}`;
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

class CallExpression extends Expression {
  constructor(token, func, callArguments) {
    super(token);
    this.func = func;
    this.callArguments = callArguments;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    let args = [];
    this.callArguments.forEach(arg => args.push(arg.string()));
    return `${this.func.string()}(${args.join(", ")})`;
  }
}

class ArrayLiteral extends Expression {
  constructor(token, elements) {
    super(token);
    this.elements = elements;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    let elems = [];
    this.elements.forEach(element => elems.push(element.string()));
    return `[${elems.join(", ")}]`;
  }
}

class IndexExpression extends Expression {
  constructor(token, left, index) {
    super(token);
    this.left = left;
    this.index = index;
  }

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `(${this.left.string()}[${this.index.string()}])`;
  }
}

export {
  Program,
  ForStatement,
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
  FunctionLiteral,
  CallExpression,
  ArrayLiteral,
  IndexExpression
};
