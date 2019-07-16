import Lexer from "./";
import Token from "../token";
import { describe, it, expect } from "../testHelpers";

describe("Lexer", () => {
  describe("test nextToken", () => {
    it("should lex the next token correctly", () => {
      const input = "a + b";
      const expected = [
        [Token.IDENTIFIER, "a"],
        [Token.PLUS, "+"],
        [Token.IDENTIFIER, "b"]
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
