import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import * as React from 'react';
import { IHash } from '../../data/api/IHash';
import { ICallback } from '../../data/api/callback';
import { ProjectTreeItemView } from './ProjectTreeItemView';
import { IProjectTree } from '../../data/api/ide/IProjectTree';

export interface IProjectTreeViewProps {
	projectTree: IProjectTree;
	callback: ICallback;
}

export class ProjectTreeView extends React.Component<IProjectTreeViewProps> {

  render() {

		const tree = this.props.projectTree;
		const projectId = tree.project.id;
		const allItems = tree.projectItems;
		const callback = this.props.callback;
		const item = allItems[projectId];

		if (!item) {
			return false;
		}

		return (
			<div className='assembly-tree-view' style={appStyles.sidebar.sidebarItems.explorer.treeView.container}>
				<ProjectTreeItemView item={item} allItems={allItems} indent={0} callback={callback} />
			</div>
		);
  }
}
