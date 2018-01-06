import { IHash } from "../../data/api/IHash";
import { CSSProperties } from "react";
import convertColor from 'css-color-converter';


const darkenColor = (value: string, frac: number) => {
  var darken = 1 - frac;
  var rgba = convertColor(value).toRgbaArray();
  var r = rgba[0] * darken;
  var g = rgba[1] * darken;
  var b = rgba[2] * darken;
  return convertColor([r, g, b]).toHexString();
}

const lightenColor = (value: string, frac: number) => {
  var lighten = 1 + frac;
  var rgba = convertColor(value).toRgbaArray();
  var r = rgba[0] * lighten;
  var g = rgba[1] * lighten;
  var b = rgba[2] * lighten;
  return convertColor([r, g, b]).toHexString();
}

const baseBgColor = '#444';
const bgColor = (level: number) => {
  return darkenColor(baseBgColor, 0.1*level);
}
const baseFontColor = '#fff';
const fontColor = (level: number) => {
  return darkenColor(baseFontColor, 0.05*level);
}

const containerHor = <CSSProperties>{
  display: 'flex',
  flexDirection: 'row',
}
const containerVer = <CSSProperties>{
  display: 'flex',
  flexDirection: 'column',
}

const fullsize = {
  width: '100%',
  height: '100%',
}

const sidebarBase = <CSSProperties> {
  ...containerHor,
  backgroundColor: bgColor(1),
}

const sidebarIcon = <CSSProperties>{
  marginBottom: '2px',
  padding: '4px',
  color: fontColor(10),
  background: bgColor(3),
}

const sidebar = {
  expanded: <CSSProperties>{
    ...sidebarBase,
    width: '20%',
  },
  collapsed: <CSSProperties>{
    ...sidebarBase,
    width: 'auto',
  },
  iconsArea: <CSSProperties> {
    ...containerVer,
    padding: '2px',
  },
  contentArea: <CSSProperties> {
    flexGrow: 1,
    backgroundColor: bgColor(3),
  },
  header: <CSSProperties> {
    backgroundColor: bgColor(1),
    textAlign: 'center',
    padding: '7px',
  },
  icons: {
    default: sidebarIcon,
    selected: {
      ...sidebarIcon,
      color: fontColor(3),
      background: bgColor(0),
    }
  },
}

const editorTab = <CSSProperties> {
  ...containerHor,
  padding: '5px',
  cursor: 'default',
  marginLeft: '1px',
  color: fontColor(6),
  backgroundColor: bgColor(-1),
}

const editorsArea = {
  container: <CSSProperties> {
    ...containerVer,
    flexGrow: 1,
  },
  tabsArea: <CSSProperties> {
    ...containerHor,
  },
  editorArea: <CSSProperties> {
    flexGrow: 1,
    backgroundColor: bgColor(2),
  },
  tabs: {
    default: editorTab,
    selected: {
      ...editorTab,
      color: fontColor(4),
      backgroundColor: bgColor(2),
    }
  }
}

const ideArea = {
  container: <CSSProperties> {
    ...fullsize,
    ...containerVer,
    color: fontColor(3),
    backgroundColor: bgColor(0),
  },
  topLine: <CSSProperties> {
    display: 'none',
  },
  midLine: <CSSProperties> {
    ...containerHor,
    flexGrow: 1,
  },
  botLine: <CSSProperties> {
    ...containerHor,
    background: '#465977',
    padding: '3px',
  },
}

const styles = {
  baseBgColor,
  baseFontColor,
  containerHor,
  containerVer,
  sidebar,
  editorsArea,
  ideArea,

  appView: <CSSProperties>{
    fontFamily: 'Consolas',
    fontSize: '10pt',
    ...fullsize,
    backgroundColor: bgColor(0),
  },
}

export const appStyles = styles;
