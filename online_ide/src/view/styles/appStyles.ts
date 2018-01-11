import { IHash } from "../../data/api/IHash";
import { CSSProperties } from "react";
import convertColor from 'css-color-converter';

const darkenColor = (value: string, frac: number) => {
  let darken = 1 - frac;
  let rgba = convertColor(value).toRgbaArray();
  let r = rgba[0] * darken;
  let g = rgba[1] * darken;
  let b = rgba[2] * darken;
  return convertColor([r, g, b]).toHexString();
};

const lightenColor = (value: string, frac: number) => {
  let lighten = 1 + frac;
  let rgba = convertColor(value).toRgbaArray();
  let r = rgba[0] * lighten;
  let g = rgba[1] * lighten;
  let b = rgba[2] * lighten;
  return convertColor([r, g, b]).toHexString();
};

const baseBgColor = '#383838';
const baseFontColor = '#e8e774';

const palette = {
  yellow: '#e8e774',
  blue: '#569cd6',
  orange: '#bd5b26',
  lightOrange: '#fdc689',
  whiteSmoke: '#c8d3d5',
  darkSmoke: '#898f90',
  baseBgColor: baseBgColor,
  baseFontColor: baseFontColor,
};

const bgColor = (level: number) => {
  return darkenColor(baseBgColor, 0.1*level);
};

const fontColor = (level: number) => {
  return darkenColor(palette.whiteSmoke, 0.05*level);
};

const containerHor = <CSSProperties> {
  display: 'flex',
  flexDirection: 'row',
};

const containerVer = <CSSProperties> {
  display: 'flex',
  flexDirection: 'column',
};

const fullsize = {
  width: '100%',
  height: '100%',
};

const sidebarBase = {
  ...containerHor,
  backgroundColor: bgColor(1),
} as CSSProperties;

const sidebarIcon = {
  marginBottom: '2px',
  padding: '4px',
  color: fontColor(10),
  background: bgColor(3),
  border: 'none',
} as CSSProperties;

const sidebar = {
  expanded: {
    ...sidebarBase,
    width: '20%',
  } as CSSProperties,
  collapsed: {
    ...sidebarBase,
    width: 'auto',
  } as CSSProperties,
  iconsArea: {
    ...containerVer,
    padding: '2px',
  } as CSSProperties,
  contentArea: {
    ...containerVer,
    flexGrow: 1,
    backgroundColor: bgColor(3),
  } as CSSProperties,
  header: {
    backgroundColor: bgColor(1),
    textAlign: 'center',
    padding: '7px',
  } as CSSProperties,
  icons: {
    default: sidebarIcon,
    selected: {
      ...sidebarIcon,
      color: fontColor(3),
      background: bgColor(-1),
    }
  },
  sidebarItems: {
    explorer: {
      container: {
        backgroundColor: bgColor(4),
        flexGrow: 1,
      } as CSSProperties,
      treeView: {
        container: {
        } as CSSProperties,
      }
    }
  }
};

const editorTab = {
  ...containerHor,
  padding: '5px',
  cursor: 'default',
  marginLeft: '1px',
  color: palette.darkSmoke,
  backgroundColor: bgColor(-1),
} as CSSProperties;

const editorsArea = {
  container: {
    ...containerVer,
		flexGrow: 1,
  } as CSSProperties,
  tabsArea: {
    ...containerHor,
  } as CSSProperties,
  editorArea: {
    flexGrow: 1,
    backgroundColor: bgColor(2),
  } as CSSProperties,
  tabs: {
    default: editorTab,
    selected: {
      ...editorTab,
      color: palette.whiteSmoke,
      backgroundColor: bgColor(2),
    }
  }
};

const ideArea = {
  container: {
    ...fullsize,
    ...containerVer,
    color: fontColor(3),
    backgroundColor: bgColor(0),
  } as CSSProperties,
  topLine: {
    display: 'none',
  } as CSSProperties,
  midLine: {
    ...containerHor,
    flexGrow: 1,
  } as CSSProperties,
  botLine: {
    ...containerHor,
    background: '#465977',
    padding: '3px',
  } as CSSProperties,
};

const styles = {
  baseBgColor,
  baseFontColor,
  containerHor,
  containerVer,
  sidebar,
  editorsArea,
  ideArea,
  palette,

  bgColor,
  fontColor,

  appView: {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '14px',
    ...fullsize,
    backgroundColor: bgColor(0),
    color: '#9cd0c6',
  } as CSSProperties,
};

export const appStyles = styles;
