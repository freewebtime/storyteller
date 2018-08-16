import * as fs from 'fs';
import { IStsConfig } from 'storyscript/shared/IStsConfig';

export const configUtils = {
  loadConfig: (rootPath: string, configPath: string): IStsConfig => {
    const configFileName = rootPath + '/' + configPath;

    if (!fs.existsSync(configFileName)) {
      console.error(`can't find config file ${configFileName}`);
      return undefined;
    }

    try {
      const configContent = fs.readFileSync(configFileName, 'utf8').toString();
      let config = JSON.parse(configContent) as IStsConfig;

      config.rootDir = rootPath + '/' + config.rootDir;
      config.outDir = rootPath + '/' + config.outDir;

      return config;

    } catch (error) {
      console.error(`can't read config file ${configFileName}`, error);
    }

    return undefined;
  }
}