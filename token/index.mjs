export default class Token {
  static get PLUS() {
    return "+";
  }

  constructor(type, literal) {
    this.type = type;
    this.literal = literal;
  }
}
