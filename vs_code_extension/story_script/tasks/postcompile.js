let path = require('path');
let fsUtils = require('../storyscript/out/fileSystem/fsUtils').fsUtils;

let rootPath = path.normalize(__dirname + '/..');

let storyscriptPath = rootPath + '/storyscript';
let clientPath = rootPath + '/client';
let serverPath = rootPath + '/server';

// copy storyscript to client/out
// let storyscriptPath = rootPath + '/storyscript';
// let clientOutPath = clientPath + '/out';
// let clientsOutStoryscriptPath = clientOutPath + '/storyscript';
// fsUtils.copyDirectory(storyscriptPath, clientsOutStoryscriptPath);

// copy storyscript to client/node_modules
let clientNodeModulesPath = clientPath + '/node_modules';
fsUtils.copyDirectory(storyscriptPath, clientNodeModulesPath + '/storyscript');

// copy storyscript to server/node_modules
let serverNodeModulesPath = serverPath + '/node_modules';
fsUtils.copyDirectory(storyscriptPath, serverNodeModulesPath + '/storyscript');

