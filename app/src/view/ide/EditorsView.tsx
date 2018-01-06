import * as React from 'react';
import * as Styles from '../stylesheets/main.css';
import { IAppState } from '../../data/api/IAppState';
import { ICallback } from '../../data/api/callback';
import { appStyles } from '../styles/appStyles';
import { SidebarView } from './SidebarView';
import { IHash } from '../../data/api/IHash';
import { FontAwesome } from '../shared/FontAwesomeIcon';

export interface IEditorsViewProps {
  state: IAppState;
  callback: ICallback;
}

export interface IEditorViewState {
  id: string;
  name: string;
  icon: string;
  content: any;
}

export interface IEditorsViewState {
  editors: IHash<IEditorViewState>;
  selectedEditorId?: string;
}

export class EditorsView extends React.Component<IEditorsViewProps, IEditorsViewState> {

  componentWillMount() {
    const editors = {
      newStory: {
        id: 'newStory',
        name: 'New Story',
        icon: 'file-code-o',
        content: (
          <div>
            New Story Content!!!
          </div>
        )
      },
      character: {
        id: 'character',
        name: 'Character',
        icon: 'file-code-o',
        content: (
          <div>
            Character Content!!!
          </div>
        )
      },
      storyPoint: {
        id: 'storyPoint',
        name: 'StoryPoint',
        icon: 'file-code-o',
        content: (
          <div>
            Story Point Content!!!
          </div>
        )
      },
    }

    this.setState({
      editors: editors,
      selectedEditorId: editors.newStory.id,
    })
  }

  closeEditor = (editorId: string) => {
    const editors = {
      ...this.state.editors
    }
    delete editors[editorId];

    let selectedEditorId = this.state.selectedEditorId;
    if (selectedEditorId === editorId) {
      for (const key in editors) {
        if (editors.hasOwnProperty(key)) {
          selectedEditorId = key;
          break;
        }
      }
    }

    this.setState({
      ...this.state,
      editors,
      selectedEditorId,
    })
  }

  selectEditor = (editorId: string) => {
    this.setState({
      ...this.state,
      selectedEditorId: editorId,
    })
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

    const selectedEditorId = this.state.selectedEditorId;
    const editors = this.state.editors;
    const selectedEditor = selectedEditorId ? this.state.editors[selectedEditorId] : undefined;

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
          }

          const closeButtonStyle = {
            ...headerItemStyle,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: appStyles.fontColor(6),
          }

          return (
            <div style={style} key={editorId} >
              <FontAwesome name={editor.icon} tag='div' style={headerItemStyle} />
              <div style={headerItemStyle} onClick={(e) => { this.handleSelectEditor(e, editorId)}} >
                {editor.name}
              </div>
              <FontAwesome name='close' tag='button' style={closeButtonStyle} onClick={(e)=>{this.handleCloseEditor(e, editorId)}} />
            </div>
          )
        })
      }
      </div>
    )

    const editorContentView = () => {
      if (selectedEditor) {
        return (
          <div style={appStyles.editorsArea.editorArea}>
            {selectedEditor.content}
          </div>
        )
      }

      return (
        <div style={appStyles.editorsArea.editorArea}>
          No openned editor
        </div>
      )
    }

    return (
      <div style={appStyles.editorsArea.container}>
        {tabsAreaView}
        {editorContentView()}
      </div>
    );
  }
}
