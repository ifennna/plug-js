import {
  ERROR,
  INTEGER,
  Integer,
  PlugError,
  ReturnValue
} from "../object/index";
import {
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  Program
} from "../ast/index";

export default function Eval(node) {
  switch (node.constructor) {
    case Program:
      return evalProgram(node);
    case ExpressionStatement:
      return Eval(node.expression);
    case PrefixExpression:
      let rightExpression = Eval(node.right);
      if (isError(rightExpression)) return rightExpression;
      return evalPrefixExpression(node.operator, rightExpression);
    case IntegerLiteral:
      return new Integer(node.value);
  }
}

const evalProgram = program => {
  let result;

  program.statements.forEach(statement => {
    result = Eval(statement);

    // if there's an error or return statement, return it and ignore the rest of
    // the code within the scope
    switch (result.constructor) {
      case ReturnValue:
        return result.value;
      case PlugError:
        return result;
    }
  });

  return result;
};

const evalPrefixExpression = (operator, right) => {
  switch (operator) {
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

const isError = object => {
  return object.type() === ERROR;
};
