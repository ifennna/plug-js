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

    //this.skipWhitespace();

    switch (this.currentChar) {
      case "+":
        token = new Token(Token.PLUS, this.currentChar);
        break;
      default:
        return 0;
    }
    this.readChar();
    return token;
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
