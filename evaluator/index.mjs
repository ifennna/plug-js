import {
  ERROR,
  INTEGER,
  Null,
  Integer,
  PlugBoolean,
  PlugError,
  ReturnValue,
  RETURN_VALUE,
  PlugString,
  STRING,
  PlugArray,
  ARRAY
} from "../object/index";
import {
  ArrayLiteral,
  BlockStatement,
  Bool,
  ExpressionStatement,
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
} from "../ast/index";

const NULL = new Null();
const TRUE = new PlugBoolean(true);
const FALSE = new PlugBoolean(false);

export default function Eval(node, env) {
  switch (node.constructor) {
    case Program:
      return evalProgram(node, env);
    case ExpressionStatement:
      return Eval(node.expression, env);
    case BlockStatement:
      return evalBlockStatement(node, env);
    case ReturnStatement:
      const value = Eval(node.returnValue, env);
      if (isError(value)) {
        return value;
      }
      return new ReturnValue(value);
    case LetStatement:
      let letValue = Eval(node.value, env);
      if (isError(letValue)) return letValue;
      env.set(node.name.value, letValue);
      break;
    case IfExpression:
      return evalIfExpression(node);
    case IndexExpression:
      const leftExpression = Eval(node.left, env);
      if (isError(leftExpression)) return leftExpression;
      const index = Eval(node.index, env);
      if (isError(index)) return index;

      return evalIndexExpression(leftExpression, index);
    case ArrayLiteral:
      const elements = evalExpressions(node.elements, env);
      if (elements.length === 1 && isError(elements[0])) return elements;
      return new PlugArray(elements);
    case InfixExpression:
      let left = Eval(node.left, env);
      if (isError(left)) return left;
      let right = Eval(node.right, env);
      if (isError(right)) return right;
      return evalInfixExpression(node.operator, left, right);
    case PrefixExpression:
      let rightExpression = Eval(node.right, env);
      if (isError(rightExpression)) return rightExpression;
      return evalPrefixExpression(node.operator, rightExpression);
    case Identifier:
      return evalIdentifier(node, env);
    case StringLiteral:
      return new PlugString(node.value);
    case IntegerLiteral:
      return new Integer(node.value);
    case Bool:
      return referenceBooleanObject(node.value);
  }
}

const evalProgram = (program, env) => {
  let result = null;

  for (let statement of program.statements) {
    result = Eval(statement, env);

    // if there's an error or return statement, return it and ignore the rest of
    // the code within the scope
    switch (result ? result.constructor : result) {
      case ReturnValue:
        result = result.value;
        return result;
      case PlugError:
        return result;
    }
  }

  return result;
};

const evalBlockStatement = (block, env) => {
  let result = null;

  for (let statement of block.statements) {
    result = Eval(statement, env);
    if (result) {
      const resultType = result.type();
      if (resultType === RETURN_VALUE || resultType === ERROR) {
        return result;
      }
    }
  }

  return result;
};

const evalExpressions = (expressions, env) => {
  let result = [];
  expressions.forEach(expression => {
    const evaluated = Eval(expression, env);
    if (isError(evaluated)) return evaluated;

    result.push(evaluated);
  });
  return result;
};

const evalIfExpression = (expression, env) => {
  const condition = Eval(expression.condition);
  if (isError(condition)) return condition;

  if (isTruthy(condition)) {
    return Eval(expression.consequence, env);
  } else if (expression.alternative) {
    return Eval(expression.alternative, env);
  } else {
    return NULL;
  }
};

const isTruthy = object => {
  switch (object) {
    case NULL:
      return false;
    case FALSE:
      return false;
    case TRUE:
      return true;
    default:
      return true;
  }
};

const evalIndexExpression = (array, index) => {
  if (array.type() !== ARRAY && index.type() !== INTEGER)
    return new PlugError(
      `Index operator not supported: ${array.type()}[${index.type()}]`
    );

  const max = array.elements.length - 1;

  if (index.value < 0 || index.value > max) {
    return new PlugError(`Array index out of bounds`);
  }

  return array.elements[index.value];
};

const evalInfixExpression = (operator, left, right) => {
  if (left.type() === INTEGER && right.type() === INTEGER) {
    return evalIntegerInfixOperation(operator, left, right);
  } else if (left.type() === STRING && right.type() === STRING) {
    return evalStringInfixOperation(operator, left, right);
  } else if (operator === "==") {
    return referenceBooleanObject(left === right);
  } else if (operator === "!=") {
    return referenceBooleanObject(left !== right);
  } else if (left.type() !== right.type()) {
    return new PlugError(
      `Type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  } else {
    return new PlugError(
      `Unknown operation: ${left.type()} ${operator} ${right.type()}`
    );
  }
};

const evalIntegerInfixOperation = (operator, left, right) => {
  switch (operator) {
    case "+":
      return new Integer(left.value + right.value);
    case "-":
      return new Integer(left.value - right.value);
    case "*":
      return new Integer(left.value * right.value);
    case "/":
      return new Integer(left.value / right.value);
    case ">":
      return referenceBooleanObject(left.value > right.value);
    case "<":
      return referenceBooleanObject(left.value < right.value);
    case "==":
      return referenceBooleanObject(left.value === right.value);
    case "!=":
      return referenceBooleanObject(left.value !== right.value);
    default:
      return new PlugError(
        `Unknown operation: ${left.type()} ${operator} ${right.type()}`
      );
  }
};

const evalStringInfixOperation = (operator, left, right) => {
  if (operator !== "+")
    return new PlugError(
      `Unknown operation: ${left.type()} ${operator} ${right.type()}`
    );

  return new PlugString(left.value + right.value);
};

const evalPrefixExpression = (operator, right) => {
  switch (operator) {
    case "!":
      return evalBangOperator(right);
    case "-":
      return evalMinusPrefixOperator(right);
    default:
      return new PlugError(`Unknown operation: ${operator}${right.type()}`);
  }
};

const evalMinusPrefixOperator = expression => {
  if (expression.type() !== INTEGER) {
    return new PlugError(`Unknown operation: -${expression.type()}`);
  }

  return new Integer(-expression.value);
};

const evalBangOperator = expression => {
  switch (expression) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      return FALSE;
  }
};

const evalIdentifier = (node, env) => {
  if (env.get(node.value)) {
    return env.get(node.value);
  } else {
    return new PlugError(`Identifier not found: ${node.value}`);
  }
};

const referenceBooleanObject = input => {
  return input ? TRUE : FALSE;
};

const isError = object => {
  return object.type() === ERROR;
};
