let path = require('path');
let typescript = require('typescript');
let child_process = require('child_process');

// execute storyscript compile
let compileStoryscriptResult = child_process.execSync('npm run compile:storyscript');
console.log('compile storysctipt...', compileStoryscriptResult.toString());

// copy storyscript to all target locations
let rootPath = path.normalize(__dirname + '/..');
let storyscriptPath = rootPath + '/storyscript';
let clientPath = rootPath + '/client';
let serverPath = rootPath + '/server';
let stsNodePath = rootPath + '/storyscript-node';
let fsUtils = require('../storyscript/out/fileSystem/fsUtils').fsUtils;

// copy storyscript to client/node_modules
fsUtils.copyDirectory(storyscriptPath, clientPath + '/node_modules/storyscript');

// copy storyscript to server/node_modules
fsUtils.copyDirectory(storyscriptPath, serverPath + '/node_modules/storyscript');

// copy storyscript to storysctip-node/node_modules
fsUtils.copyDirectory(storyscriptPath, stsNodePath + '/node_modules/storyscript');

// compile server
let compileServerResult = child_process.execSync('npm run compile:server');
console.log('compile server...', compileServerResult.toString());

// compile client
let compileClientResult = child_process.execSync('npm run compile:client');
console.log('compile client...', compileClientResult.toString());

// compile storyscript-node
let compileStoryscriptNodeResult = child_process.execSync('npm run compile:storyscript-node');
console.log('compile storyscript-node...', compileStoryscriptNodeResult.toString());

// copy storyscript-node to client/node_modules
fsUtils.copyDirectory(stsNodePath, clientPath + '/node_modules/storyscript-node');

// copy storyscript-node to server/node_modules
fsUtils.copyDirectory(stsNodePath, serverPath + '/node_modules/storyscript-node');
