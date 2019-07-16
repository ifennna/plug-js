import Lexer from "./";
import Token from "../token";
import { describe, it, expect } from "../testHelpers";

describe("Lexer", () => {
  describe("test nextToken", () => {
    it("should lex the next token correctly", () => {
      const input = "a = b + 1";
      const expected = [
        [Token.IDENTIFIER, "a"],
        [Token.ASSIGN, "="],
        [Token.IDENTIFIER, "b"],
        [Token.PLUS, "+"],
        [Token.INT, 1]
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
