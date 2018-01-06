import * as React from 'react';
import * as Styles from '../stylesheets/main.css';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';

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
        Explorer View Content
      </div>
    )
  }
}
