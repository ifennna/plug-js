class Node {
  tokenLiteral() {}
  string() {}
}

class Statement extends Node {
  statementNode() {}
}

class Expression extends Node {
  expressionNode() {}
}

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

export { Program, LetStatement, ExpressionStatement, Identifier };
