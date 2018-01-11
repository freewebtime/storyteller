import { IHash } from "../IHash";

export interface IEditorData {
	id: string;
	name: string;
	icon: string;
	isSelected?: boolean;
	projectItemId: string;
	editorViewId: string;
}

export interface IEditorsPanel {
	editors: IHash<IEditorData>;
	selectedEditorId?: string;
}