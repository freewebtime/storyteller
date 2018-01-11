import * as React from 'react';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { ProjectTreeView } from './ProjectTreeView';
import { IIde } from '../../data/api/ide/IIde';

export interface IExplorerViewProps {
  ide: IIde;
  callback: ICallback;
}

export interface IExplorerViewState {
}

export class ExplorerView extends React.Component<IExplorerViewProps, IExplorerViewState> {

  render() {

		const callback = this.props.callback;
		const ide = this.props.ide;
		
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
