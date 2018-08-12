import { fsUtils } from "../fileSystem/fsUtils";
import { IStsProject, IStsProjectItem } from "./IStsProject";
import { IStsConfig } from "../configuration/IStsConfig";
import { stsProjectFactory } from "./stsProjectFactory";
import { IFileSystemItem, FileSystemItemType } from "../shared/IFileSystemItem";

export const projectUtils = {
  readProject: (config: IStsConfig): IStsProject => {
    const rootDir = fsUtils.getSourceFiles(config);

    if (!rootDir) {
      console.error("can't read file hierarhy");
      return undefined;
    }

    if (!config) {
      return undefined;
    }

    let projectItems = projectUtils.createProjectItems([rootDir]);
    let result = stsProjectFactory.createProject(config.main, rootDir, projectItems);

    return result;
  },

  createProjectItems: (fsItems: IFileSystemItem[]): IStsProjectItem[] => {
    if (!fsItems) {
      return undefined;
    }

    let result = fsItems.map((fsItem: IFileSystemItem) => {
      let projectItem: IStsProjectItem;
      
      if (fsItem.type === FileSystemItemType.folder) {

        let fsSubitems: IFileSystemItem[];
        if (fsItem.subitems) {

          for (const key in fsItem.subitems) {
            let fsSubitem = fsItem.subitems[key];
            fsSubitems = fsSubitems || [];
            fsSubitems = [
              ...fsSubitems,
              fsSubitem
            ];
          }

        }

        let subitems: IStsProjectItem[];

        if (fsSubitems) {
          subitems = projectUtils.createProjectItems(fsSubitems);
        }

        projectItem = stsProjectFactory.createProjectItemFolder(fsItem, subitems);

        return projectItem;
      } else {
        // fsItem is file
        let projectItem = stsProjectFactory.createProjectModule(fsItem, undefined, undefined, undefined);
        return projectItem;
      } 
    });

    return result;
  },

}
