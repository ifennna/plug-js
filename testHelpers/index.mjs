import { PlugError } from "../object/index";

const describe = (description, func) => {
  console.log(description);
  func();
};

const it = (message, func) => describe(`    ${message}`, func);

const assertions = actual => ({
  toEqual: expected => {
    if (actual === expected) {
      console.log("        pass");
      return true;
    } else {
      const message = `fail: ${actual} does not equal ${expected}`;
      throw new Error(message);
    }
  },

  toImplement: expected => {
    if (actual instanceof expected) {
      console.log("        pass");
      return true;
    } else {
      const message =
        actual instanceof PlugError
          ? actual.message
          : `fail: ${actual} is not an instance of ${expected} class`;
      throw new Error(message);
    }
  }
});

const expect = actual => assertions(actual);

export { describe, it, expect };
