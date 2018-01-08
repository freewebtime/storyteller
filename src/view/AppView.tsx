import * as React from 'react';
import { ICallback } from '../data/api/callback';
import { IAppState } from '../data/api/IAppState';
import { IdeView } from './ide/IdeView';
import { appStyles } from './styles/appStyles';
import brands from '@fortawesome/fontawesome-free-brands';
import solid from '@fortawesome/fontawesome-free-solid';
import regular from '@fortawesome/fontawesome-free-regular';
import fontawesome from '@fortawesome/fontawesome';

fontawesome.library.add(brands, solid, regular);

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
