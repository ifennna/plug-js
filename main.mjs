import Lexer from "./lexer";

const lexer = new Lexer("samantha - +");

console.log(lexer.nextToken());
console.log(lexer.nextToken());
console.log(lexer.nextToken());
console.log(lexer.nextToken());
