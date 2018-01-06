const convertColor = require('css-color-converter');

const Darken = (value, frac) => {
  var darken = 1 - parseFloat(frac);
  var rgba = convertColor(value).toRgbaArray();
  var r = rgba[0] * darken;
  var g = rgba[1] * darken;
  var b = rgba[2] * darken;
  return convertColor([r, g, b]).toHexString();
}

const Increment = (source, value) => {
  return source + value;
}

const TestColor = () => {
  return convertColor([128, 0.5, 255]).toHexString();
}


const Functions = {
  Darken: Darken,
  Increment: Increment,
  TestColor: TestColor,
}
