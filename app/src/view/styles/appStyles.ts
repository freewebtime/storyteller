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

const palette = {
  yellow: '#e8e774',
  blue: '#569cd6',
  orange: '#bd5b26',
  lightOrange: '#fdc689',
  whiteSmoke: '#c8d3d5',
  darkSmoke: '#898f90',
}

const baseBgColor = '#383838';
const bgColor = (level: number) => {
  return darkenColor(baseBgColor, 0.1*level);
}

const baseFontColor = '#e8e774';
const fontColor = (level: number) => {
  return darkenColor(palette.whiteSmoke, 0.05*level);
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
      background: bgColor(-1),
    }
  },
}

const editorTab = <CSSProperties> {
  ...containerHor,
  padding: '5px',
  cursor: 'default',
  marginLeft: '1px',
  color: palette.darkSmoke,
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
      color: palette.whiteSmoke,
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
  palette,

  appView: <CSSProperties>{
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '14px',
    ...fullsize,
    backgroundColor: bgColor(0),
    color: '#9cd0c6',
  },
}

export const appStyles = styles;
