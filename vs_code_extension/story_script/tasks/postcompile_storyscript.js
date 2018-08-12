let path = require('path');
let fsUtils = require('../storyscript/out/fileSystem/fsUtils').fsUtils;

let rootPath = path.normalize(__dirname + '/..');

let storyscriptPath = rootPath + '/storyscript';
let clientPath = rootPath + '/client';
let serverPath = rootPath + '/server';

// copy storyscript to client/out
// fsUtils.copyDirectory(storyscriptPath, clientPath + '/out/storyscript');

// copy storyscript to client/node_modules
fsUtils.copyDirectory(storyscriptPath, clientPath + '/node_modules/storyscript');

// copy storyscript to server/node_modules
fsUtils.copyDirectory(storyscriptPath, serverPath + '/node_modules/storyscript');

