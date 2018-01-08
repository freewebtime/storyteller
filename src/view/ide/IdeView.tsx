import * as React from 'react';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { SidebarView, ISidebarItemViewProps, SidebarType } from './SidebarView';
import { EditorsView } from './EditorsView';
import { IHash } from '../../data/api/IHash';
import { ExplorerView } from './ExplorerView';

export interface IIdeViewProps {
  appState: IAppState;
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
        view: (<ExplorerView appState={this.props.appState} callback={this.props.callback} />)
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

    return (
      <div style={appStyles.ideArea.container}>
        <div style={appStyles.ideArea.topLine}>
          Topline
        </div>
        <div style={appStyles.ideArea.midLine} >
					{leftSidebarView}
          <EditorsView callback={this.props.callback} />
					{rightSidebarView}
				</div>
        <div style={appStyles.ideArea.botLine}>
          Footer Content
        </div>
      </div>
    );
  }
}
