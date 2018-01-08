import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import * as React from 'react';
import { IPtiViewData, ProjectTreeItemView } from './ProjectTreeItemView';
import { IHash } from '../../data/api/IHash';
import { IProject } from '../../data/api/ide/IProject';
import { IProjectItem } from '../../data/api/ide/IProjectItem';

export interface IProjectTreeViewState {
  selectedItemId?: string;
  treeItems?: IHash<IPtiViewData>;
  project?: IProject;
  projectItems?: IHash<IProjectItem>;
}

export interface IProjectTreeViewProps {
  appState: IAppState;
}

export class ProjectTreeView extends React.Component<IProjectTreeViewProps, IProjectTreeViewState> {
  constructor(props: IProjectTreeViewProps) {
    super(props);
    this.state = this.calcState(props);
  }

  calcState = (props: IProjectTreeViewProps) => {
    const oldState = this.state;
    const appState = props.appState;
    const project = appState.project;

    if (!project) {
      return {};
    }

    if (!oldState || oldState.projectItems !== project.items) {
      const oldItems = oldState && oldState.treeItems ? oldState.treeItems : {};
      const treeItems: IHash<IPtiViewData> = {};

      Object.keys(project.items).map((projectItemId: string) => {
        const projectItem = project.items[projectItemId];
        const oldTreeItem = oldItems[projectItemId];
        if (oldTreeItem && oldTreeItem.projectItem === projectItem) {
          treeItems[projectItemId] = oldTreeItem;
        } else {
          const treeItemData: IPtiViewData = oldTreeItem
            ? oldTreeItem
            : {
              id: projectItem.id,
              projectItem: projectItem,
              isCollapsed: false,
            }
            ;

          treeItems[projectItemId] = {
            ...treeItemData,
            id: projectItem.id,
            projectItem: projectItem,
            onClick: this.onItemClick,
            onDoubleClick: this.onItemDoubleClick,
            onSetIsCollapsed: this.onSetIsCollapsed,
          };
        }
      });

      return {
        project: project,
        projectItems: project.items,
        treeItems: treeItems,
      };
    }

    return {};
  }

  updateState = (props: IProjectTreeViewProps) => {
    const oldState = this.state;
    const newState = this.calcState(props);

    if (oldState !== newState) {
      this.setState(newState);
    }
  }

  componentWillReceiveProps(nextProps: IProjectTreeViewProps) {
    this.updateState(nextProps);
  }

  onItemClick = (itemId: string) => {
    if (this.state.selectedItemId !== itemId) {
      this.setState({
        ...this.state,
        selectedItemId: itemId,
      });
    }
  }
  onItemDoubleClick = (itemId: string) => {
		//something
  }

  onSetIsCollapsed = (itemId: string, isCollapsed: boolean) => {
    if (!this.state || !this.state.treeItems) {
      return;
    }

    const treeItem = this.state.treeItems[itemId];
    if (!treeItem) {
      return;
    }

    const treeItems = {
      ...this.state.treeItems,
      [itemId]: {
        ...treeItem,
        isCollapsed: isCollapsed,
      },
    };

    this.setState({
      ...this.state,
      treeItems: treeItems,
    });
  }

  render() {

    if (!this.state) {
      return false;
    }

    const treeItems = this.state.treeItems;
    const project = this.state.project;

    if (!treeItems || !project) {
      return false;
    }

    const selectedItemId = this.state.selectedItemId;
    const rootItemData = treeItems[project.id];

    if (!rootItemData) {
      return false;
    }

    const appState = this.props.appState;

    return (
      <div className='assembly-tree-view' style={appStyles.sidebar.sidebarItems.explorer.treeView.container}>
        <ProjectTreeItemView data={rootItemData} indent={0} allItems={treeItems} selectedItemId={selectedItemId} appState={appState} />
      </div>
    );
  }
}
