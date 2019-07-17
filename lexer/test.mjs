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
      }
      let result = add(five, ten);
      !-/*5;
      5 < 10 > 5;
      if(5 < 10) {
        return true;
      } else {
        return false;
      }
      10 == 10;
      10 != 9;
      "foobar"
      "foo bar"
      [1, 2];`;

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
        [Token.LET, "let"],
        [Token.IDENTIFIER, "result"],
        [Token.ASSIGN, "="],
        [Token.IDENTIFIER, "add"],
        [Token.LPAREN, "("],
        [Token.IDENTIFIER, "five"],
        [Token.COMMA, ","],
        [Token.IDENTIFIER, "ten"],
        [Token.RPAREN, ")"],
        [Token.SEMICOLON, ";"],
        [Token.BANG, "!"],
        [Token.MINUS, "-"],
        [Token.SLASH, "/"],
        [Token.ASTERISK, "*"],
        [Token.INT, "5"],
        [Token.SEMICOLON, ";"],
        [Token.INT, "5"],
        [Token.LT, "<"],
        [Token.INT, "10"],
        [Token.GT, ">"],
        [Token.INT, "5"],
        [Token.SEMICOLON, ";"],
        [Token.IF, "if"],
        [Token.LPAREN, "("],
        [Token.INT, "5"],
        [Token.LT, "<"],
        [Token.INT, "10"],
        [Token.RPAREN, ")"],
        [Token.LBRACE, "{"],
        [Token.RETURN, "return"],
        [Token.TRUE, "true"],
        [Token.SEMICOLON, ";"],
        [Token.RBRACE, "}"],
        [Token.ELSE, "else"],
        [Token.LBRACE, "{"],
        [Token.RETURN, "return"],
        [Token.FALSE, "false"],
        [Token.SEMICOLON, ";"],
        [Token.RBRACE, "}"],
        [Token.INT, "10"],
        [Token.EQ, "=="],
        [Token.INT, "10"],
        [Token.SEMICOLON, ";"],
        [Token.INT, "10"],
        [Token.NOT_EQ, "!="],
        [Token.INT, "9"],
        [Token.SEMICOLON, ";"],
        [Token.STRING, "foobar"],
        [Token.STRING, "foo bar"],
        [Token.LBRACKET, "["],
        [Token.INT, "1"],
        [Token.COMMA, ","],
        [Token.INT, "2"],
        [Token.RBRACKET, "]"],
        [Token.SEMICOLON, ";"],
        [Token.EOF, ""]
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
