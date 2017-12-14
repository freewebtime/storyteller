import * as React from 'react';
import { IState } from '../data/api/IState';
import { ICallback } from '../data/api/callback';

export interface IAppViewProps {
  state: IState;
  callback: ICallback;
}

export class AppView extends React.Component<IAppViewProps> {
  render() {
    return (
      <div className={'app-content'}>
        Hello world
      </div>
    );
  }
}
