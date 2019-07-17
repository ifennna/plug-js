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
  static get STRING() {
    return "STRING";
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
  static get EQ() {
    return "==";
  }
  static get NOT_EQ() {
    return "!=";
  }

  static get LT() {
    return "<";
  }
  static get GT() {
    return ">";
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
  static get LBRACKET() {
    return "[";
  }
  static get RBRACKET() {
    return "]";
  }

  static get FUNCTION() {
    return "FUNCTION";
  }
  static get LET() {
    return "LET";
  }
  static get RETURN() {
    return "RETURN";
  }
  static get TRUE() {
    return "TRUE";
  }
  static get FALSE() {
    return "FALSE";
  }
  static get IF() {
    return "IF";
  }
  static get ELSE() {
    return "ELSE";
  }
  static get FOR() {
    return "FOR";
  }

  constructor(type, literal) {
    this.type = type;
    this.literal = literal;
  }

  static get keywords() {
    return {
      func: Token.FUNCTION,
      let: Token.LET,
      return: Token.RETURN,
      if: Token.IF,
      else: Token.ELSE,
      true: Token.TRUE,
      false: Token.FALSE,
      for: Token.FOR
    };
  }
  static lookUpIdentifier(identifier) {
    if (Object.prototype.hasOwnProperty.call(Token.keywords, identifier)) {
      return Token.keywords[identifier];
    }

    return Token.IDENTIFIER;
  }
}
