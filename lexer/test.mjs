import Lexer from "./";
import Token from "../token";
import { describe, it, expect } from "../testHelpers";

describe("Lexer", () => {
  describe("test nextToken", () => {
    it("should lex the next token correctly", () => {
      const input = "let five = 5;";
      const expected = [
        [Token.LET, "let"],
        [Token.IDENTIFIER, "five"],
        [Token.ASSIGN, "="],
        [Token.INT, "5"],
        [Token.SEMICOLON, ";"]
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
