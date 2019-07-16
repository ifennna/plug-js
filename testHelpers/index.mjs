const describe = (description, func) => {
  console.log(description);
  func();
};

const it = (message, func) => describe(`    ${message}`, func);

const assertions = actual => ({
  toEqual: expected => {
    if (actual === expected) {
      console.log("pass");
      return true;
    } else {
      console.log(`fail: ${actual} does not equal ${expected}`);
      return false;
    }
  }
});

const expect = actual => assertions(actual);

export { describe, it, expect };
