import * as React from 'react';
import * as Styles from './stylesheets/main.css';
import { ICallback } from '../data/api/callback';
import { IAppState } from '../data/api/IAppState';
import { IdeView } from './ide/IdeView';
import { appStyles } from './styles/appStyles';

export interface IAppViewProps {
  state: IAppState;
  callback: ICallback;
}

export class AppView extends React.Component<IAppViewProps> {
  render() {
    return (
      <div style={appStyles.appView}>
        <IdeView appState={this.props.state} callback={this.props.callback}/>
      </div>
    );
  }
}
