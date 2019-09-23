import {
  ERROR,
  INTEGER,
  STRING,
  ARRAY,
  RETURN_VALUE,
  Null,
  Integer,
  PlugBoolean,
  PlugError,
  ReturnValue,
  PlugString,
  PlugArray,
  PlugFunction,
  Builtin
} from "../object/index.js";
import {
  ArrayLiteral,
  BlockStatement,
  Bool,
  CallExpression,
  ExpressionStatement,
  FunctionLiteral,
  ForStatement,
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
import { EnclosedEnvironment } from "../object/environment.js";
import { builtins } from "./builtins.js";

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
    case ForStatement:
      return evalForLoop(node, env);
    case FunctionLiteral:
      const parameters = node.parameters;
      const body = node.body;
      return new PlugFunction(parameters, body, env);
    case CallExpression:
      const func = Eval(node.func, env);
      if (isError(func)) return func;
      const args = evalExpressions(node.callArguments, env);
      if (args.length === 1 && isError(args[0])) return args[0];

      return applyFunction(func, args);
    case IfExpression:
      return evalIfExpression(node, env);
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
      if (node.operator === "=") return evalAssignment(node, env);
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

const evalForLoop = (statement, env) => {
  let body;
  let value;

  const loopNumber = statement.range.callArguments[0];
  if (loopNumber.constructor === IntegerLiteral) {
    value = loopNumber.value;
  } else if (loopNumber.constructor === Identifier) {
    value = env.get(loopNumber.value).value;
  }

  for (let i = 0; i < value; i++) {
    env.set(statement.index.value, new Integer(i));
    body = evalBlockStatement(statement.body, env);

    if (body) {
      const resultType = body.type();
      if (resultType === RETURN_VALUE || resultType === ERROR) {
        return body;
      }
    }
  }
  return body;
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

const evalAssignment = (node, env) => {
  const value = Eval(node.right, env);
  if (isError(value)) return value;

  switch (node.left.constructor) {
    case Identifier:
      env.set(node.left.value, value);
      break;
    case IndexExpression:
      const name = node.left.left.value;
      const array = env.get(name);
      if (!array) return PlugError("Array has not been declared");
      const index = getIndex(node, env);
      const elements = array.elements;
      while (elements.length < index + 1) {
        elements.push(NULL);
      }
      elements[index] = value;
      array.elements = elements;
      env.set(name, array);
  }
};

const getIndex = (node, env) => {
  let indexValue;
  const index = node.left.index;
  switch (index.constructor) {
    case IntegerLiteral:
      indexValue = index.value;
      break;
    case Identifier:
      const indexObject = env.get(index.value);
      indexValue = indexObject.value;
  }
  return indexValue;
};

const applyFunction = (func, args) => {
  switch (func.constructor) {
    case PlugFunction:
      const innerEnv = createFunctionScope(func, args);
      const evaluated = Eval(func.body, innerEnv);
      return unwrapReturnValue(evaluated);
    case Builtin:
      return func.func(...args);
    default:
      return new PlugError(`Not a function ${func.constructor.name}`);
  }
};

const createFunctionScope = (func, args) => {
  // pass in the function's environment to allow for closures
  const env = new EnclosedEnvironment(func.environment);

  func.parameters.forEach((param, index) => {
    env.set(param.value, args[index]);
  });

  return env;
};

const unwrapReturnValue = object => {
  return object instanceof ReturnValue ? object.value : object;
};

const evalIfExpression = (expression, env) => {
  const condition = Eval(expression.condition, env);
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
  switch (true) {
    case left.type() === INTEGER && right.type() === INTEGER:
      return evalIntegerInfixOperation(operator, left, right);
    case left.type() === STRING && right.type() === STRING:
      return evalStringInfixOperation(operator, left, right);
    case operator === "==":
      return referenceBooleanObject(left === right);
    case operator === "!=":
      return referenceBooleanObject(left !== right);
    case left.type() !== right.type():
      return new PlugError(
        `Type mismatch: ${left.type()} ${operator} ${right.type()}`
      );
    default:
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
  }
  if (builtins.has(node.value)) return builtins.get(node.value);

  return new PlugError(`Identifier not found: ${node.value}`);
};

const referenceBooleanObject = input => {
  return input ? TRUE : FALSE;
};

const isError = object => {
  return object.type() === ERROR;
};
