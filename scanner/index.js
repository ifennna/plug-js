import { Environment } from "../object/environment.js";
import Lexer from "../lexer/index.js";
import Parser from "../parser/index.js";
import Eval from "../evaluator/index.js";
import { setPrinter } from "../evaluator/builtins.js";

export const Scan = (text, out) => {
  const env = new Environment();

  const lexer = new Lexer(text);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  if (parser.Errors.length !== 0) {
    printParserErrors(parser.Errors);
    return;
  }

  setPrinter(out);
  Eval(program, env);
};

const printParserErrors = (errors, out) => {
  out.write("Parser Errors: \n");
  errors.forEach(error => out.write(`${error}\n`));
};
