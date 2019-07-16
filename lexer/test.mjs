import Lexer from "./";
import Token from "../token";
import { describe, it, expect } from "../testHelpers";

describe("Lexer", () => {
  describe("test nextToken", () => {
    it("should lex the next token correctly", () => {
      const input = `let five = 5;
      let ten = 10;
      let add = func(x, y) {
        x + y;
      }`;
      const expected = [
        [Token.LET, "let"],
        [Token.IDENTIFIER, "five"],
        [Token.ASSIGN, "="],
        [Token.INT, "5"],
        [Token.SEMICOLON, ";"],
        [Token.LET, "let"],
        [Token.IDENTIFIER, "ten"],
        [Token.ASSIGN, "="],
        [Token.INT, "10"],
        [Token.SEMICOLON, ";"],
        [Token.LET, "let"],
        [Token.IDENTIFIER, "add"],
        [Token.ASSIGN, "="],
        [Token.FUNCTION, "func"],
        [Token.LPAREN, "("],
        [Token.IDENTIFIER, "x"],
        [Token.COMMA, ","],
        [Token.IDENTIFIER, "y"],
        [Token.RPAREN, ")"],
        [Token.LBRACE, "{"],
        [Token.IDENTIFIER, "x"],
        [Token.PLUS, "+"],
        [Token.IDENTIFIER, "y"],
        [Token.SEMICOLON, ";"],
        [Token.RBRACE, "}"],
      ];

      const lexer = new Lexer(input);

      expected.forEach(testCase => {
        const resultToken = lexer.nextToken();
        expect(resultToken.type).toEqual(testCase[0]);
        expect(resultToken.literal).toEqual(testCase[1]);
      });
    });
  });
});
