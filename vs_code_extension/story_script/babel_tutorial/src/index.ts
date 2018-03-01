const babel = require("babel-core");
const babylon = require("babylon");
const fs = require('fs');

var options = {
  plugins: [],
  sourceMaps: true,
};

let files = fs.readdirSync('.');

let fileContent = fs.readFile('/');

let sourceCode = "if (true) return;";
let sourceAst = babylon.parse(sourceCode, { allowReturnOutsideFunction: true });
let { code, map, ast } = babel.transformFromAst(sourceAst, sourceCode, options);

console.log(sourceCode, sourceAst, ast, code, map);
