import Token from "../token";

export default class Lexer {
  constructor(input) {
    this.input = input;
    this.currentPosition = 0;
    this.readPosition = 0;
    this.currentChar = "";

    this.readChar();
  }

  nextToken() {
    let token;

    this.skipWhitespace();

    switch (this.currentChar) {
      case "=":
        token = new Token(Token.ASSIGN, this.currentChar);
        break;
      case "+":
        token = new Token(Token.PLUS, this.currentChar);
        break;
      case "-":
        token = new Token(Token.MINUS, this.currentChar);
        break;
      case ",":
        token = new Token(Token.COMMA, this.currentChar);
        break;
      case "(":
        token = new Token(Token.LPAREN, this.currentChar);
        break;
      case ")":
        token = new Token(Token.RPAREN, this.currentChar);
        break;
      case "{":
        token = new Token(Token.LBRACE, this.currentChar);
        break;
      case "}":
        token = new Token(Token.RBRACE, this.currentChar);
        break;
      case ";":
        token = new Token(Token.SEMICOLON, this.currentChar);
        break;
      case 0:
        token = new Token(Token.EOF, "");
        break;
      default:
        if (this.isLetter(this.currentChar)) {
          const literal = this.readIdentifier();
          const identifier = Token.lookUpIdentifier(literal);
          token = new Token(identifier, literal);
          return token;
        } else if (this.isDigit(this.currentChar)) {
          const digit = this.readNumber();
          token = new Token(Token.INT, digit);
          return token;
        } else {
          token = new Token(Token.ILLEGAL, this.currentChar);
        }
    }
    this.readChar();
    return token;
  }

  skipWhitespace() {
    while (
      this.currentChar === " " ||
      this.currentChar === "\t" ||
      this.currentChar === "\n" ||
      this.currentChar === "\r"
    ) {
      this.readChar();
    }
  }

  isLetter(character) {
    return (
      ("a" <= character && character <= "z") ||
      ("A" <= character && character <= "Z") ||
      character === "_"
    );
  }

  isDigit(character) {
    debugger;
    return "0" <= character && character <= "9";
  }

  readIdentifier() {
    const position = this.currentPosition;
    while (this.isLetter(this.currentChar)) {
      this.readChar();
    }
    return this.input.slice(position, this.currentPosition);
  }

  readNumber() {
    const position = this.currentPosition;
    while (this.isDigit(this.currentChar)) {
      this.readChar();
    }
    return this.input.slice(position, this.currentPosition);
  }

  readChar() {
    this.currentChar =
      this.readPosition >= this.input.length
        ? 0
        : this.input.charAt(this.readPosition);

    this.currentPosition = this.readPosition;
    this.readPosition++;
  }
}
