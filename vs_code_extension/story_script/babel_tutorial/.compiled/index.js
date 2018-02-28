"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const babylon = require("babylon");
const code = `function square(n) {
  return n * n;
}`;
const parseResult = babylon.parse(code);
console.log(parseResult);
// Node {
//   type: "File",
//   start: 0,
//   end: 38,
//   loc: SourceLocation {...},
//   program: Node {...},
//   comments: [],
//   tokens: [...]
// }
//# sourceMappingURL=index.js.map