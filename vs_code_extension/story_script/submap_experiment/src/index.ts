'use strict';

import * as ts from 'typescript';
import * as path from 'path';
import * as vscode from 'vscode';

const babel = require("babel-core");
const babylon = require("babylon");
const fs = require('fs');

var options = {
  plugins: [],
  sourceMaps: true,
};

let files = fs.readdirSync('.');

let fileContent = fs.readFileSync('./content/index.sts');

let sourceCode = "if (true) return;";
let sourceAst = babylon.parse(sourceCode, { allowReturnOutsideFunction: true });
let { code, map, ast } = babel.transformFromAst(sourceAst, sourceCode, options);

console.log(sourceCode, sourceAst, ast, code, map);
