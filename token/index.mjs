export default class Token {
  static get ILLEGAL() {
    return "ILLEGAL";
  }
  static get EOF() {
    return "EOF";
  }

  static get IDENTIFIER() {
    return "IDENTIFIER";
  }
  static get INT() {
    return "INT";
  }

  static get ASSIGN() {
    return "=";
  }
  static get PLUS() {
    return "+";
  }
  static get MINUS() {
    return "-";
  }

  constructor(type, literal) {
    this.type = type;
    this.literal = literal;
  }
}
