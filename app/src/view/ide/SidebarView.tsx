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
}

export enum SidebarType {
  Left,
  Right,
}

export interface ISidebarViewProps {
  items: IHash<ISidebarItemViewProps>;
  sidebarType: SidebarType;
  selectedItemId: string;
}

export class SidebarView extends React.Component<ISidebarViewProps, ISidebarViewState> {
  componentWillMount() {
    this.setState({
      isCollapsed: false,
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

  render() {

    const selectedItemId = this.props.selectedItemId;
    const items = this.props.items;
    const selectedItem = items[selectedItemId];
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
            <FontAwesome key={itemId} name={item.icon} size='2x' style={style} onClick={this.toggleIsCollapsed} />
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
