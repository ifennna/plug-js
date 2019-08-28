export const INTEGER = "INTEGER";
export const BOOLEAN = "BOOLEAN";
export const NULL = "NULL";
export const STRING = "STRING";
export const FUNCTION = "FUNCTION";
export const RETURN_VALUE = "RETURN_VALUE";
export const ARRAY = "ARRAY";
export const ERROR = "ERROR";
export const BUILTIN = "BUILTIN";

class Object {
  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return this.constructor.name;
    }
  }
}

class Null extends Object {
  type() {
    return NULL;
  }

  inspect() {
    return "null";
  }
}

class Integer extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return INTEGER;
  }

  inspect() {
    return this.value;
  }
}

class PlugString extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return STRING;
  }

  inspect() {
    return this.value;
  }
}

class PlugBoolean extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return BOOLEAN;
  }

  inspect() {
    return this.value;
  }
}

class PlugArray extends Object {
  constructor(elements) {
    super();
    this.elements = elements;
  }

  type() {
    return ARRAY;
  }

  inspect() {
    let elemStrings = [];
    this.elements.forEach(element => elemStrings.push(element.inspect()));

    return `[${elemStrings.join(", ")}]`;
  }
}

class ReturnValue extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return RETURN_VALUE;
  }

  inspect() {
    return this.value.inspect();
  }
}

class PlugFunction extends Object {
  constructor(parameters, body, environment) {
    super();
    this.parameters = parameters;
    this.body = body;
    this.environment = environment;
  }

  type() {
    return FUNCTION;
  }

  inspect() {
    let argStrings = [];
    this.parameters.forEach(param => argStrings.push(param.inspect()));

    return `func(${argStrings.join(", ")}) 
    ${this.body.string()}`;
  }
}

class PlugError extends Object {
  constructor(message) {
    super();
    this.message = message;
  }

  type() {
    return ERROR;
  }

  inspect() {
    return `Error: ${this.message}`;
  }
}

export {
  Null,
  Integer,
  PlugString,
  PlugBoolean,
  PlugArray,
  PlugFunction,
  ReturnValue,
  PlugError
};
