import * as Styles from '../stylesheets/main.css';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import * as React from 'react';
import { FontAwesome } from '../shared/FontAwesomeIcon';
import { IAssemblyItem, AssemlbyItemType, IFolder } from '../../data/api/ide/IAssemblyItem';
import { findAssemblyItem } from '../../data/helpers/assemblyHeler';
import { IAtviViewProps, AtviView } from './AssemblyTreeViewItem';

export interface IAssemblyTreeViewState {
  selectedItemId?: string;
}

export class AssemblyTreeView extends React.Component<{ appState: IAppState }, IAssemblyTreeViewState> {

  onItemClick = (itemId: string) => {
    if (this.state.selectedItemId !== itemId) {
      this.setState({
        ...this.state,
        selectedItemId: itemId,
      })
    }
  }
  onItemDoubleClick = (itemId: string) => {
    console.log('item double click', itemId);
  }

  componentWillMount() {
    this.setState({
      selectedItemId: undefined,
    })
  }

  render() {

    const assembly = this.props.appState.assembly;
    if (!assembly) {
      return false;
    }

    const items = assembly.items;
    const rootItems = assembly.rootItems;
    if (!items || !rootItems || rootItems.length === 0) {
      return false;
    }

    return (
      <div className='assembly-tree-view' style={appStyles.sidebar.sidebarItems.explorer.treeView.container}>
        {
          rootItems.map((rootItemId) => {
            const rootItem = items[rootItemId];
            if (rootItem) {
              const itemProps: IAtviViewProps = {
                indent: 0,
                assemblyItem: rootItem,
                onClick: this.onItemClick,
                onDoubleClick: this.onItemDoubleClick,
              }

              return (
                <AtviView key={rootItemId} data={itemProps} selectedItemId={this.state.selectedItemId} appState={this.props.appState} />
              )
            }
          })
        }
      </div>
    )
  }
}
