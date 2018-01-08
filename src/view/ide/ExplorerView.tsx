import * as React from 'react';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { ProjectTreeView } from './ProjectTreeView';

export interface IExplorerViewProps {
  appState: IAppState;
  callback: ICallback;
}

export interface IExplorerViewState {
}

export class ExplorerView extends React.Component<IExplorerViewProps, IExplorerViewState> {

  render() {

		const appState = this.props.appState;
		const callback = this.props.callback;
		const ide = appState.ide;
		
		if (!ide) {
			return false;
		}

		const projectTree = ide.projectTree;

    return (
      <div className='explorer-view'>
        <ProjectTreeView projectTree={projectTree} callback={callback} />
      </div>
    );
  }
}
