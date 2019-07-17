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
  static get SLASH() {
    return "/";
  }
  static get ASTERISK() {
    return "*";
  }
  static get BANG() {
    return "!";
  }

  static get COMMA() {
    return ",";
  }
  static get SEMICOLON() {
    return ";";
  }
  static get LPAREN() {
    return "(";
  }
  static get RPAREN() {
    return ")";
  }
  static get LBRACE() {
    return "{";
  }
  static get RBRACE() {
    return "}";
  }

  static get FUNCTION() {
    return "FUNCTION";
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
      func: Token.FUNCTION,
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
