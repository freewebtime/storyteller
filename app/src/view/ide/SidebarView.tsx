import * as React from 'react';
import * as Styles from '../stylesheets/main.css';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { IHash } from '../../data/api/IHash';
import { FontAwesome } from '../shared/FontAwesomeIcon';

export interface ISidebarItemViewProps {
  id: string;
  icon: string;
  name: string;
  view: any;
}

interface ISidebarViewState {
  isCollapsed: boolean;
  selectedItemId?: string;
}

export enum SidebarType {
  Left,
  Right,
}

export interface ISidebarViewProps {
  selectedItemId?: string;
  items: IHash<ISidebarItemViewProps>;
  sidebarType: SidebarType;
}

export class SidebarView extends React.Component<ISidebarViewProps, ISidebarViewState> {
  componentWillMount() {

    let selectedItemId = this.props.selectedItemId;
    if (!selectedItemId) {
      for (const key in this.props.items) {
        if (this.props.items.hasOwnProperty(key)) {
          selectedItemId = key;
          break;
        }
      }
    }

    this.setState({
      isCollapsed: false,
      selectedItemId: selectedItemId,
    })
  }

  toggleIsCollapsed = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      ...this.state,
      isCollapsed: !this.state.isCollapsed,
    })
  }

  setSidebarIsCollapsed = (isCollapsed: boolean) => {
    if (this.state.isCollapsed === isCollapsed) {
      return;
    }

    this.setState({
      ...this.state,
      isCollapsed: isCollapsed,
    })
  }

  handleIconClick = (e, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.selectedItemId === itemId && !this.state.isCollapsed) {
      this.setSidebarIsCollapsed(true);
      return;
    }

    this.setState({
      ...this.state,
      isCollapsed: false,
      selectedItemId: itemId,
    })
  }

  render() {

    const selectedItemId = this.state.selectedItemId;
    const items = this.props.items;
    const selectedItem = selectedItemId ? items[selectedItemId] : undefined;
    const isCollapsed = this.state.isCollapsed;

    const contentView = selectedItem && !isCollapsed
      ? (
        <div style={appStyles.sidebar.contentArea}>
          <div style={appStyles.sidebar.header} onClick={this.toggleIsCollapsed} >
            <FontAwesome name={selectedItem.icon} /> {selectedItem.name}
          </div>
          <div>
            {selectedItem.view}
          </div>
        </div>)
      : false
    ;

    const iconsView = (
      <div style={appStyles.sidebar.iconsArea} >
        {Object.keys(items).map((itemId: string) => {
          const item = items[itemId];
          const isSelected = item.id === selectedItemId;
          const style = isSelected
            ? appStyles.sidebar.icons.selected
            : appStyles.sidebar.icons.default
            ;
          return (
            <FontAwesome key={itemId} name={item.icon} size='2x' style={style} onClick={(e) => { this.handleIconClick(e, itemId)}} />
          )
        })}
      </div>
    )

    const sidebarStyle = isCollapsed
      ? appStyles.sidebar.collapsed
      : appStyles.sidebar.expanded
    ;

    const sidebarContent = this.props.sidebarType === SidebarType.Left
      ? (
        <div className='sidebar-view' style={sidebarStyle} >
          {iconsView}
          {contentView}
        </div>
      )
      : (
        <div className='sidebar-view' style={sidebarStyle} >
          {contentView}
          {iconsView}
        </div>
      )

    return sidebarContent;
  }
}
