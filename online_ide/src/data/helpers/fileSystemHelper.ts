import { appConfig } from "../config/appConfig";
import { isNullOrEmpty } from "./index";

export const createPath = (folderName: string, itemName: string) => {
  if (isNullOrEmpty(folderName)) {
    return itemName;
  }

  folderName = folderName.trim();
  if (folderName.endsWith(appConfig.PathSeparator)) {
    folderName = folderName.substr(0, folderName.length-1);
  }

  if (isNullOrEmpty(folderName)) {
    return itemName;
  }

  return `${folderName}${appConfig.PathSeparator}${itemName}`;
};
