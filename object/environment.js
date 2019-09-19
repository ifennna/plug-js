export class Environment {
  constructor(outer = null) {
    this.store = new Map();
    this.outer = outer;
  }

  get(name) {
    if (this.store.has(name)) {
      return this.store.get(name);
    } else if (this.outer) {
      return this.outer.get(name);
    } else {
      return false;
    }
  }

  set(name, value) {
    this.store.set(name, value);
    return value;
  }
}

export class EnclosedEnvironment extends Environment {
  constructor(outerEnvironment) {
    super(outerEnvironment);
  }
}
