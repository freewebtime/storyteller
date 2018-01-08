import { IHash } from "../IHash";

export interface IEditorWindow {
	id: string;
	name: string;
	isSelected?: boolean;
}

export interface IEditorsPanel {
	editors: IHash<IEditorWindow>;
	selectedEditorId?: string;
}