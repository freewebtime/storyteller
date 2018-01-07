import * as React from 'react';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import { ProjectTreeView } from './ProjectTreeView';

export interface IExplorerViewProps {
  appState: IAppState;
  callback: ICallback;
}

export interface IExplorerViewState {
}

export class ExplorerView extends React.Component<IExplorerViewProps, IExplorerViewState> {

  render() {
    return (
      <div className='explorer-view'>
        <ProjectTreeView appState={this.props.appState} />
      </div>
    )
  }
}
