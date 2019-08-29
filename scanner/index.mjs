import { Environment } from "../object/environment";
import Lexer from "../lexer/index";
import Parser from "../parser/index";
import Eval from "../evaluator/index";

export const Scan = text => {
  const env = new Environment();

  const lexer = new Lexer(text);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  if (parser.Errors.length !== 0) {
    printParserErrors(parser.Errors);
    return;
  }

  Eval(program, env);
};

const printParserErrors = errors => {
  console.log("Parser Errors: \n");
  errors.forEach(error => console.log(`${error}\n`));
};
