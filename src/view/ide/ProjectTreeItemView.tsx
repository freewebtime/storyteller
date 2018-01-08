import * as React from 'react';
import { FontAwesomeIcon } from '../shared/FontAwesomeIcon';
import { CSSProperties } from 'react';
import { IHash } from '../../data/api/IHash';
import { IAppState } from '../../data/api/IAppState';
import { appStyles } from '../styles/appStyles';
import { projectTreeItemActions } from '../../data/reducers/ide/projectTreeItemReducer';
import { ICallback } from '../../data/api/callback';
import { IProjectTreeItem, ProjectTreeItemType } from '../../data/api/ide/IProjectTree';

export interface IProjectTreeItemViewProps {
	indent: number;
	item: IProjectTreeItem;
	allItems: IHash<IProjectTreeItem>;
	callback: ICallback;
}

export interface IProjectTreeItemViewState {
  isMouseOver: boolean;
  lastTimeClick: number;
}

export class ProjectTreeItemView extends React.Component<IProjectTreeItemViewProps, IProjectTreeItemViewState> {
  state = {
    isMouseOver: false,
    lastTimeClick: 0,
  };

  onMouseEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.isMouseOver) {
      this.setState({
        ...this.state,
        isMouseOver: true,
      });
    }
  }
  onMouseOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.isMouseOver) {
      this.setState({
        ...this.state,
        isMouseOver: true,
      });
    }
  }
  onMouseOut = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.isMouseOver) {
      this.setState({
        ...this.state,
        isMouseOver: false,
      });
    }
  }

	updateTreeItemData = (newValues: {}) => {
		const itemData = this.props.item.data;
		const itemId = itemData.id;
		const callback = this.props.callback;
		projectTreeItemActions.Commands.UpdateTreeItem(itemId, newValues, callback);
	}

  setIsCollapsed = (isCollapsed: boolean) => {
		this.updateTreeItemData({isCollapsed});
	}

  handleToggleIsCollapsed = (e) => {
    e.preventDefault();
		e.stopPropagation();
		
		const isCollapsed = this.props.item.data.isCollapsed === true;
    this.setIsCollapsed(!isCollapsed);
  }

  onClick = () => {
		const itemData = this.props.item.data;
		const itemId = itemData.id;
		const callback = this.props.callback;
		projectTreeItemActions.Commands.SelectTreeItem(itemId, callback);
  }

	onRenameClick = () => {
		const itemData = this.props.item.data;
		const itemId = itemData.id;
		const callback = this.props.callback;
		projectTreeItemActions.Commands.EditTreeItem(itemId, callback);
	}

  onDoubleClick = () => {
		// TODO: open editor with clicked item
  }

  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const now = new Date().getTime();
    const lastTimeClick = this.state.lastTimeClick;
    const delta = now - lastTimeClick;

    if (delta > 500) {
			
			if (delta < 1500) {
				this.setState({
					...this.state,
					lastTimeClick: 0,
				});
				this.onRenameClick();
			} else {
				this.setState({
					...this.state,
					lastTimeClick: now,
				});
				this.onClick();
			}

		} else {
      this.setState({
        ...this.state,
        lastTimeClick: 0,
      });
      this.onDoubleClick();
    }
  }

  subitemsView = () => {
		const treeItem = this.props.item;
		const isCollapsed = treeItem.data.isCollapsed === true;

		if (isCollapsed) {
			return false;
		}

		const subitems = treeItem.data.subitems;
    if (!subitems) {
      return false;
    }

    const indent = this.props.indent + 1;
		const allItems = this.props.allItems;
		const callback = this.props.callback;

    return (
      <div className='subitems'>
        {
          Object.keys(subitems).map((subitemId: string) => {
            const subitem = allItems[subitemId];
            if (subitem) {
              return (
                <ProjectTreeItemView key={subitemId} indent={indent} allItems={allItems} item={subitem} callback={callback} />
              );
						}
						
						return false;
          })
        }
      </div>
    );
  }

  dashboardView = () => {
    const isSelected = this.props.item.data.isSelected === true;
    if (!isSelected) {
      return false;
    }

    const btnStyle = {
      background: 'none',
      border: 'none',
      color: appStyles.fontColor(4),
      margin: '0px 2px',
    };

    return (
      <div style={appStyles.containerHor}>
				<FontAwesomeIcon icon='edit' style={btnStyle} />
				<FontAwesomeIcon icon='plus' style={btnStyle} />
				<FontAwesomeIcon icon='plus-square' style={btnStyle} />
				<FontAwesomeIcon icon='times' style={btnStyle} />
      </div>
    );
  }

  render() {

		const treeItem = this.props.item;
		const itemData = treeItem.data;
		const isSelected = itemData.isSelected === true;
		const isCollapsed = itemData.isCollapsed === true;
		const isEditing = itemData.isEditing === true;
    const caption = itemData.name;

    const headerItemStyle = {
      padding: '2px',
    };
    const collapseBtnStyle = {
      ...headerItemStyle,
      border: 'none',
      background: 'none',
      color: appStyles.fontColor(5),
      minWidth: '0.7em',
    };
    const headerTextStyle = {
      ...headerItemStyle,
      flexGrow: 1,
    };

    const collapseBtnIcon = isCollapsed ? 'angle-right' : 'angle-down';
    const isFolder = itemData.projectTreeItemType !== ProjectTreeItemType.File;
    const collapseBtnView = isFolder
			? (<FontAwesomeIcon icon={collapseBtnIcon} style={collapseBtnStyle} onClick={this.handleToggleIsCollapsed} />)
      : false
    ;

    const icon = isFolder
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
      alignItems: 'center',
    };

    const dashboardView = this.dashboardView();

		const headerView = (
			<div className='header' style={headerStyle} onMouseEnter={this.onMouseEnter} onMouseOut={this.onMouseOut} onClick={this.handleClick} onMouseOver={this.onMouseOver}>
				{collapseBtnView}
				<FontAwesomeIcon icon={icon} style={headerItemStyle} />
				<div style={headerTextStyle}>
					{caption}
				</div>
				{dashboardView}
			</div>
		);

    return (
      <div className='atviView' >
				{headerView}
        {this.subitemsView()}
      </div>
    );
  }
}
