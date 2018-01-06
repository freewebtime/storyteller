import * as Styles from '../stylesheets/main.css';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import * as React from 'react';
import { FontAwesome } from '../shared/FontAwesomeIcon';
import { IAssemblyItem, AssemlbyItemType, IFolder } from '../../data/api/ide/IAssemblyItem';
import { findAssemblyItem } from '../../data/helpers/assemblyHeler';

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
        <AssemblyTreeView appState={this.props.appState} />
      </div>
    )
  }
}

export interface IAtviViewProps {
  indent: number;
  assemblyItem: IAssemblyItem;
}

export interface IAtviViewState {
  isCollapsed: boolean;
}

export class AtviView extends React.Component<{data: IAtviViewProps, appState: IAppState}, IAtviViewState> {
  componentWillMount() {
    this.setState({
      isCollapsed: false,
    })
  }

  getSubitems = () => {
    // if (this.state.isCollapsed) {
    //   return undefined;
    // }

    const item = this.props.data.assemblyItem;
    switch (item.assemlbyItemType) {
      case AssemlbyItemType.Folder:
      case AssemlbyItemType.Project: {
        const fItem = item as IFolder;
        return fItem ? fItem.subitems : undefined;
      }

      default: {
        return undefined;
      }
    }
  }

  subitemsView = () => {
    const subitems = this.getSubitems();
    if (!subitems) {
      return false;
    }

    return (
      <div className='subitems'>
      {
        Object.keys(subitems).map((subitemId: string) => {
          const subitem = findAssemblyItem(subitemId, this.props.appState.assembly);
          if (subitem) {
            const itemProps: IAtviViewProps = {
              indent: this.props.data.indent+1,
              assemblyItem: subitem,
            }

            return (
              <AtviView key={subitemId} data={itemProps} appState={this.props.appState} />
            )
          }
        })
      }
      </div>
    )
  }

  render () {
    const icon = 'file-o';
    const caption = this.props.data.assemblyItem.name;

    return (
      <div className='atviView' >
        <div className='header' style={{ marginLeft: this.props.data.indent * 0.8 + 'em' }}>
          <FontAwesome name={icon} /> {caption}
        </div>
        {this.subitemsView()}
      </div>
    )
  }
}

export class AssemblyTreeView extends React.Component<{appState: IAppState}, {}> {

  render () {

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
              }

              return (
                <AtviView key={rootItemId} data={itemProps} appState={this.props.appState} />
              )
            }
          })
        }
      </div>
    )
  }
}
