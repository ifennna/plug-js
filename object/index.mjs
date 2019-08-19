export const INTEGER = "INTEGER";
export const BOOLEAN = "BOOLEAN";
export const NULL = "NULL";
export const STRING = "STRING";
export const FUNCTION = "FUNCTION";
export const RETURN_VALUE = "RETURN_VALUE";
export const ARRAY = "ARRAY";
export const ERROR = "ERROR";
export const BUILTIN = "BUILTIN";

class Null {
  type() {
    return NULL;
  }

  inspect() {
    return "null";
  }
}

class Integer {
  constructor(value) {
    this.value = value;
  }

  type() {
    return INTEGER;
  }

  inspect() {
    return this.value;
  }
}

class String {
  constructor(value) {
    this.value = value;
  }

  type() {
    return STRING;
  }

  inspect() {
    return this.value;
  }
}

class Boolean {
  constructor(value) {
    this.value = value;
  }

  type() {
    return BOOLEAN;
  }

  inspect() {
    return this.value;
  }
}

class ReturnValue {
  constructor(value) {
    this.value = value;
  }

  type() {
    return RETURN_VALUE;
  }

  inspect() {
    return this.value;
  }
}

class PlugError {
  constructor(message) {
    this.message = message;
  }

  type() {
    return ERROR;
  }

  inspect() {
    return `Error: ${this.message}`;
  }
}

export { Integer, String, Boolean, ReturnValue, PlugError };
