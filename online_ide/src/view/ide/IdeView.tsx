import * as React from 'react';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { SidebarView, ISidebarItemViewProps, SidebarType } from './SidebarView';
import { IHash } from '../../data/api/IHash';
import { ExplorerView } from './ExplorerView';
import { EditorsPanel } from './EditorsPanelView';
import { IIde } from '../../data/api/ide/IIde';
import { IProject } from '../../data/api/project/IProject';

export interface IIdeViewProps {
	ide: IIde;
	project: IProject;
  callback: ICallback;
}

export class IdeView extends React.Component<IIdeViewProps> {

	openProjectItemInEditor = (itemId: string) => {
		
	}

  getSidebarItems = (sidebarType: SidebarType): IHash<ISidebarItemViewProps> => {
    const sidebarItems: IHash<ISidebarItemViewProps> = {
      explorer: {
        icon: 'file-code',
        id: 'explorer',
        name: 'Explorer',
        view: (<ExplorerView ide={this.props.ide} callback={this.props.callback} />)
      },
      properties: {
        icon: 'wrench',
        id: 'properties',
        name: 'Properties',
        view: (
          <div className='properties-view'>
            Selected object properties
          </div>
        ),
      }
    };

    return sidebarItems;
  }

  render() {

    const leftSidebarItems = this.getSidebarItems(SidebarType.Left);
    const rightSidebarItems = this.getSidebarItems(SidebarType.Right);

		const leftSidebarView = (
			<SidebarView selectedItemId='explorer' items={leftSidebarItems} sidebarType={SidebarType.Left} />
		);
		const rightSidebarView = (
			<SidebarView selectedItemId='properties' items={rightSidebarItems} sidebarType={SidebarType.Right} />
		);

		const ide = this.props.ide;
		const editorsPanel = ide.editorsPanel; 
		const project = this.props.project;

    return (
      <div style={appStyles.ideArea.container}>
        <div style={appStyles.ideArea.topLine}>
          Topline
        </div>
        <div style={appStyles.ideArea.midLine} >
					{leftSidebarView}
          <EditorsPanel editorsPanel={editorsPanel} callback={this.props.callback} project={project} />
					{rightSidebarView}
				</div>
        <div style={appStyles.ideArea.botLine}>
          Footer Content
        </div>
      </div>
    );
  }
}
