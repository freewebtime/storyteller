import * as React from 'react';
import { ICallback } from '../data/api/callback';
import { IAppState } from '../data/api/IAppState';

export interface IAppViewProps {
  state: IAppState;
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
