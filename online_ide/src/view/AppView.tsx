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
  appState: IAppState;
  callback: ICallback;
}

export class AppView extends React.Component<IAppViewProps> {
  render() {

		const appState = this.props.appState;
		const ide = appState.ide;
		const project = appState.project;

    return (
      <div style={appStyles.appView}>
        <IdeView ide={ide} callback={this.props.callback} project={project}/>
      </div>
    );
  }
}
