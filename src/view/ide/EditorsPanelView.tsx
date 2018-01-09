import * as React from 'react';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { IHash } from '../../data/api/IHash';
import { FontAwesomeIcon } from '../shared/FontAwesomeIcon';
import { editorsPanelActions } from '../../data/reducers/ide/editorsPanelReducer';
import { IEditorsPanel } from '../../data/api/ide/IEditorsPanel';

export interface IEditorsPanelProps {
	editorsPanel: IEditorsPanel;
	callback: ICallback;
}

export class EditorsPanel extends React.Component<IEditorsPanelProps> {

  closeEditor = (editorId: string) => {
		editorsPanelActions.Commands.CloseEditor(editorId, this.props.callback);
  }

  selectEditor = (editorId: string) => {
		editorsPanelActions.Commands.OpenEditor(editorId, this.props.callback);
  }

  handleCloseEditor = (e: any, editorId: string) => {
    e.preventDefault();
    e.stopPropagation();

    this.closeEditor(editorId);
  }
  handleSelectEditor = (e: any, editorId: string) => {
    e.preventDefault();
    e.stopPropagation();

    this.selectEditor(editorId);
  }

  render() {

		const editorsPanel = this.props.editorsPanel;
		const editors = editorsPanel.editors;
		const selectedEditorId = editorsPanel.selectedEditorId;

    const tabsAreaView = (
      <div style={appStyles.editorsArea.tabsArea}>
      {
        Object.keys(editors).map((editorId: string) => {
          const editor = editors[editorId];
          const isSelected = editorId === selectedEditorId;
          const style = isSelected
            ? appStyles.editorsArea.tabs.selected
            : appStyles.editorsArea.tabs.default
          ;

          const headerItemStyle = {
            padding: '2px',
          };

          const closeButtonStyle = {
            ...headerItemStyle,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: appStyles.fontColor(6),
          };

          return (
						<div style={style} key={editorId} onClick={(e) => { this.handleSelectEditor(e, editorId); }}>
							<FontAwesomeIcon icon={editor.icon} tag='div' style={headerItemStyle} />
              <div style={headerItemStyle} >
                {editor.name}
              </div>
							<FontAwesomeIcon icon='times-circle' tag='button' style={closeButtonStyle} onClick={(e)=> {this.handleCloseEditor(e, editorId);}} />
            </div>
          );
        })
      }
      </div>
    );

    const editorContentView = () => {
			const selectedEditor = editorsPanel.editors[selectedEditorId];
      if (selectedEditor) {
        return (
          <div style={appStyles.editorsArea.editorArea}>
            {selectedEditor.name}: {selectedEditor.id}
          </div>
        );
      }

      return (
        <div style={appStyles.editorsArea.editorArea}>
          No openned editor
        </div>
      );
    };

    return (
      <div style={appStyles.editorsArea.container}>
        {tabsAreaView}
        {editorContentView()}
      </div>
	  );
  }
}
