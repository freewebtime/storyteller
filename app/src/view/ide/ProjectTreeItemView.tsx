import * as Styles from '../stylesheets/main.css';
import { ICallback } from '../../data/api/callback';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import * as React from 'react';
import { FontAwesome } from '../shared/FontAwesomeIcon';
import { findAssemblyItem } from '../../data/helpers/assemblyHeler';
import { CSSProperties } from 'react';
import { IProjectItem, IFolder, ProjectItemType } from '../../data/api/ide/IProjectItem';
import { IHash } from '../../data/api/IHash';

export interface IPtiViewData {
  id: string;
  projectItem: IProjectItem;
  isCollapsed: boolean;
  onClick?: (itemId: string) => void,
  onDoubleClick?: (itemId: string) => void,
  onSetIsCollapsed?: (itemId: string, isCollapsed: boolean) => void,
}

export interface IProjectTreeItemViewProps {
  data: IPtiViewData;
  indent: number;
  selectedItemId?: string;
  allItems: IHash<IPtiViewData>;
  appState: IAppState;
}

export interface IProjectTreeItemViewState {
  isMouseOver: boolean;
  lastTimeClick: number;
}

export class ProjectTreeItemView extends React.Component<IProjectTreeItemViewProps, IProjectTreeItemViewState> {

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

  setIsCollapsed = (isCollapsed: boolean) => {
    if (this.props.data.onSetIsCollapsed) {
      this.props.data.onSetIsCollapsed(this.props.data.id, isCollapsed);
    }
  }

  handleToggleIsCollapsed = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setIsCollapsed(!this.props.data.isCollapsed);
  }

  onClick = () => {
    if (this.props.data.onClick) {
      this.props.data.onClick(this.props.data.projectItem.id);
    }
  }

  onDoubleClick = () => {
    if (this.props.data.onDoubleClick) {
      this.props.data.onDoubleClick(this.props.data.projectItem.id);
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
      isMouseOver: false,
      lastTimeClick: 0,
    })
  }

  getSubitems = () => {
    if (this.props.data.isCollapsed) {
      return undefined;
    }

    const projectItem = this.props.data.projectItem;
    return projectItem.subitems;
  }

  subitemsView = () => {
    const subitems = this.getSubitems();
    if (!subitems) {
      return false;
    }

    const indent = this.props.indent + 1
    const selectedItemId = this.props.selectedItemId;
    const appState = this.props.appState;
    const allItems = this.props.allItems;

    return (
      <div className='subitems'>
        {
          Object.keys(subitems).map((subitemId: string) => {
            const subitem = allItems[subitemId];
            if (subitem) {
              return (
                <ProjectTreeItemView key={subitemId} indent={indent} data={subitem} allItems={allItems} selectedItemId={selectedItemId} appState={appState} />
              )
            }
          })
        }
      </div>
    )
  }

  dashboardView = () => {
    const isSelected = this.props.selectedItemId === this.props.data.projectItem.id;
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

    const caption = this.props.data.projectItem.name;
    const isSelected = this.props.selectedItemId === this.props.data.projectItem.id;

    const headerItemStyle = {
      padding: '2px',
    }
    const collapseBtnStyle = {
      ...headerItemStyle,
      border: 'none',
      background: 'none',
      color: appStyles.fontColor(5),
      minWidth: '0.7em',
    }
    const headerTextStyle = {
      ...headerItemStyle,
      flexGrow: 1,
    }

    const collapseBtnIcon = this.props.data.isCollapsed ? 'caret-right' : 'caret-down';
    const item = this.props.data.projectItem;
    const isFolder = item.projectItemType === ProjectItemType.Folder;
    const collapseBtnView = isFolder
      ? (<FontAwesome name={collapseBtnIcon} style={collapseBtnStyle} onClick={this.handleToggleIsCollapsed} />)
      : false
    ;

    const icon = item.projectItemType === ProjectItemType.Folder
      ? 'folder'
      : 'file'
    ;

    const headerStyle: CSSProperties = {
      ...appStyles.containerHor,
      padding: `0px 0px 0px ${(this.props.indent * 1) + 'em'}`,
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
