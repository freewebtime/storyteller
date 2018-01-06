import * as React from 'react';
import * as Styles from '../stylesheets/main.css';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { SidebarView } from './SidebarView';

export interface IEditorsViewProps {
  state: IAppState;
  callback: ICallback;
}

export class EditorsView extends React.Component<IEditorsViewProps> {

  render() {
    const sidebarItems = {}

    return (
      <div style={appStyles.editorsView}>
        Editors View
      </div>
    );
  }
}
