import * as Styles from '../stylesheets/main.css';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import * as React from 'react';
import { FontAwesome } from '../shared/FontAwesomeIcon';
import { IAssemblyItem, AssemlbyItemType, IFolder } from '../../data/api/ide/IAssemblyItem';
import { findAssemblyItem } from '../../data/helpers/assemblyHeler';
import { CSSProperties } from 'react';

export interface IAtviViewProps {
  indent: number;
  assemblyItem: IAssemblyItem;
  onClick?: (itemId: string)=>void,
  onDoubleClick?: (itemId: string)=>void,
}

export interface IAtviViewState {
  isCollapsed: boolean;
  isMouseOver: boolean;
  lastTimeClick: number;
}

export class AtviView extends React.Component<{ data: IAtviViewProps, selectedItemId?: string, appState: IAppState }, IAtviViewState> {

  onMouseEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.isMouseOver) {
      this.setState({
        ...this.state,
        isMouseOver: true,
      })
    }
  }
  onMouseOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.isMouseOver) {
      this.setState({
        ...this.state,
        isMouseOver: true,
      })
    }
  }
  onMouseOut = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.isMouseOver) {
      this.setState({
        ...this.state,
        isMouseOver: false,
      })
    }
  }

  handleToggleIsCollapsed = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      ...this.state,
      isCollapsed: !this.state.isCollapsed,
    })
  }

  onClick = () => {
    if (this.props.data.onClick) {
      this.props.data.onClick(this.props.data.assemblyItem.id);
    }
  }

  onDoubleClick = () => {
    if (this.props.data.onDoubleClick) {
      this.props.data.onDoubleClick(this.props.data.assemblyItem.id);
    }
  }

  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const now = new Date().getTime();
    const lastTimeClick = this.state.lastTimeClick;
    const delta = now - lastTimeClick;

    if (delta > 500) {
      this.setState({
        ...this.state,
        lastTimeClick: now,
      })
      this.onClick();
    }
    else {
      this.setState({
        ...this.state,
        lastTimeClick: 0,
      })
      this.onDoubleClick();
    }
  }

  componentWillMount() {
    this.setState({
      isCollapsed: false,
      isMouseOver: false,
      lastTimeClick: 0,
    })
  }

  getSubitems = () => {
    if (this.state.isCollapsed) {
      return undefined;
    }

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
                indent: this.props.data.indent + 1,
                assemblyItem: subitem,
                onClick: this.props.data.onClick,
                onDoubleClick: this.props.data.onDoubleClick,
              }

              return (
                <AtviView key={subitemId} data={itemProps} selectedItemId={this.props.selectedItemId} appState={this.props.appState} />
              )
            }
          })
        }
      </div>
    )
  }

  dashboardView = () => {
    const isSelected = this.props.selectedItemId === this.props.data.assemblyItem.id;
    if (!isSelected) {
      return false;
    }

    const btnStyle = {
      background: 'none',
      border: 'none',
      color: appStyles.fontColor(4),
      margin: '0px 2px',
    }

    return (
      <div style={appStyles.containerHor}>
        <FontAwesome name='edit' tag='button' style={btnStyle} />
        <FontAwesome name='plus-square-o' tag='button' style={btnStyle} />
        <FontAwesome name='plus-square' tag='button' style={btnStyle} />
        <FontAwesome name='remove' tag='button' style={btnStyle} />
      </div>
    )
  }

  render() {

    const caption = this.props.data.assemblyItem.name;
    const isSelected = this.props.selectedItemId === this.props.data.assemblyItem.id;

    const headerItemStyle = {
      padding: '2px',
    }
    const collapseBtnStyle = {
      ...headerItemStyle,
      border: 'none',
      background: 'none',
      color: appStyles.fontColor(5),
      width: '1em',
      height: '1em',
    }
    const headerTextStyle = {
      ...headerItemStyle,
      flexGrow: 1,
    }

    const collapseBtnIcon = this.state.isCollapsed ? 'caret-right' : 'caret-down';
    const item = this.props.data.assemblyItem;
    const isFolderOrProject = item.assemlbyItemType === AssemlbyItemType.Folder || item.assemlbyItemType === AssemlbyItemType.Project;
    const collapseBtnView = isFolderOrProject
      ? (<FontAwesome name={collapseBtnIcon} tag='button' style={collapseBtnStyle} onClick={this.handleToggleIsCollapsed} />)
      : false
    ;

    let icon = 'file';
    if (item.assemlbyItemType === AssemlbyItemType.Folder) {
      icon = 'folder';
    }
    else if (item.assemlbyItemType === AssemlbyItemType.Project) {
      icon = 'inbox'
    }

    const headerStyle: CSSProperties = {
      ...appStyles.containerHor,
      margin: `0px 0px 0px ${(this.props.data.indent * 1) + 'em'}`,
      background: this.state.isMouseOver
        ? appStyles.bgColor(2)
        : (isSelected
          ? appStyles.bgColor(3)
          : 'none'
        )
      ,
      alignItems: 'baseline',
    }

    const dashboardView = this.dashboardView();

    return (
      <div className='atviView' >
        <div className='header' style={headerStyle} onMouseEnter={this.onMouseEnter} onMouseOut={this.onMouseOut} onClick={this.handleClick} onMouseOver={this.onMouseOver}>
          {collapseBtnView}
          <FontAwesome name={icon} style={headerItemStyle} />
          <div style={headerTextStyle}>
            {caption}
          </div>
          {dashboardView}
        </div>
        {this.subitemsView()}
      </div>
    )
  }
}
