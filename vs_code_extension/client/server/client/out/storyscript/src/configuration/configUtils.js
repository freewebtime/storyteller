"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.configUtils = {
    loadConfig: (rootPath, configPath) => {
        const configFileName = rootPath + '/' + configPath;
        if (!fs.existsSync(configFileName)) {
            console.error(`can't find config file ${configFileName}`);
            return undefined;
        }
        try {
            const configContent = fs.readFileSync(configFileName, 'utf8').toString();
            let config = JSON.parse(configContent);
            config.rootDir = rootPath + '/' + config.rootDir;
            config.outDir = rootPath + '/' + config.outDir;
            return config;
        }
        catch (error) {
            console.error(`can't read config file ${configFileName}`, error);
        }
        return undefined;
    }
};
//# sourceMappingURL=configUtils.js.map