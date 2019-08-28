import {
  ARRAY,
  NULL,
  Builtin,
  Integer,
  PlugArray,
  PlugError,
  PlugString
} from "../object/index";

export const builtins = new Map();

const lengthFunction = (...args) => {
  if (args.length !== 1)
    return new PlugError(
      `Invalid number of arguments to 'len', expected 1, got ${args.length}`
    );

  switch (args[0].constructor) {
    case PlugArray:
      return new Integer(args[0].elements.length);
    case PlugString:
      return new Integer(args[0].value.length);
    default:
      return new PlugError(
        `Argument to 'len' not supported, got ${args[0].type()}`
      );
  }
};

const firstFunction = (...args) => {
  if (args.length !== 1)
    return new PlugError(
      `Invalid number of arguments to 'first', expected 1, got ${args.length}`
    );

  if (args[0].type() !== ARRAY)
    return new PlugError(
      `Argument to 'first' must be an array, got ${args[0].type()}`
    );

  const array = args[0];
  if (array.elements.length > 0) {
    return array.elements[0];
  }

  return NULL;
};

const lastFunction = (...args) => {
  if (args.length !== 1)
    return new PlugError(
      `Invalid number of arguments to 'last', expected 1, got ${args.length}`
    );

  if (args[0].type() !== ARRAY)
    return new PlugError(
      `Argument to 'last' must be an array, got ${args[0].type()}`
    );

  const array = args[0];
  const length = array.elements.length;
  if (length > 0) {
    return array.elements[length - 1];
  }

  return NULL;
};

const restFunction = (...args) => {
  if (args.length !== 1)
    return new PlugError(
      `Invalid number of arguments to 'rest', expected 1, got ${args.length}`
    );

  if (args[0].type() !== ARRAY)
    return new PlugError(
      `Argument to 'rest' must be an array, got ${args[0].type()}`
    );

  const array = args[0];
  const length = array.elements.length;
  if (length > 0) {
    return new PlugArray(array.elements.slice(0, -1));
  }

  return NULL;
};

const pushFunction = (...args) => {
  if (args.length !== 2)
    return new PlugError(
      `Invalid number of arguments to 'push', expected 2, got ${args.length}`
    );

  if (args[0].type() !== ARRAY)
    return new PlugError(
      `First argument to 'push' not supported, expected ARRAY, got ${args[0].type()}`
    );

  const array = args[0];

  return new PlugArray(array.elements.push(args[1]));
};

const printFunction = (...args) => {
  args.forEach(argument => console.log(argument.inspect()));
};

builtins.set("len", new Builtin(lengthFunction));
builtins.set("first", new Builtin(firstFunction));
builtins.set("last", new Builtin(lastFunction));
builtins.set("rest", new Builtin(restFunction));
builtins.set("push", new Builtin(pushFunction));
builtins.set("print", new Builtin(printFunction));
