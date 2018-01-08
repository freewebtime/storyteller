import { IProjectItem } from "../project/IProjectItem";
import { IHash } from "../IHash";
import { IProject } from "../project/IProject";

export enum ProjectTreeItemType {
	Project,
	Folder,
	File,
}

export interface IProjectTreeItem {
	projectItem?: IProjectItem;
	data?: {
		id: string;
		parentId: string;
		name: string;
		projectTreeItemType: ProjectTreeItemType;
		subitems?: IHash<string>;
		isCollapsed?: boolean;
		isEditing?: boolean;
		isSelected?: boolean;
	};
}

export interface IProjectTree {
	project?: IProject;
	projectItems?: IHash<IProjectTreeItem>;
	selectedProjectItemId?: string;
}
