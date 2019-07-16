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

  static get SEMICOLON() {
    return ";";
  }

  static get LET() {
    return "LET";
  }

  constructor(type, literal) {
    this.type = type;
    this.literal = literal;
  }

  static get keywords() {
    return {
      let: Token.LET
    };
  }
  static lookUpIdentifier(identifier) {
    if (Object.prototype.hasOwnProperty.call(Token.keywords, identifier)) {
      return Token.keywords[identifier];
    }

    return Token.IDENTIFIER;
  }
}
