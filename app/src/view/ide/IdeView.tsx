import * as React from 'react';
import * as Styles from '../stylesheets/main.css';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { SidebarView, ISidebarItemViewProps, SidebarType } from './SidebarView';
import { EditorsView } from './EditorsView';
import { IHash } from '../../data/api/IHash';

export interface IIdeViewProps {
  state: IAppState;
  callback: ICallback;
}

export class IdeView extends React.Component<IIdeViewProps> {

  render() {

    const sidebarItems: IHash<ISidebarItemViewProps> = {
      explorer: {
        icon: 'file-code-o',
        id: 'explorer',
        name: 'Objects Explorer',
        view: (
          <div className='explorer-view'>
            Explorer Content
          </div>
        )
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
    }

    return (
      <div style={appStyles.ideArea.container}>
        <div style={appStyles.ideArea.topLine}>
          Topline
        </div>
        <div style={appStyles.ideArea.midLine} >
          <SidebarView selectedItemId='explorer' items={sidebarItems} sidebarType={SidebarType.Left} />
          <EditorsView state={this.props.state} callback={this.props.callback} />
          <SidebarView selectedItemId='properties' items={sidebarItems} sidebarType={SidebarType.Right} />
        </div>
        <div style={appStyles.ideArea.botLine}>
          Footer Content
        </div>
      </div>
    );
  }
}
