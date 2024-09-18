import _implicitStylesheets from "./style.css";
import _implicitScopedStylesheets from "./style.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  styleDecls: [["color", "blue", false]],
  key: 0,
};
const stc1 = {
  styleDecls: [["color", "blue", false]],
  key: 1,
};
const stc2 = {
  styleDecls: [["color", "blue", false]],
  key: 2,
};
const stc3 = {
  styleDecls: [["box-shadow", "10px 5px 5px black", false]],
  key: 3,
};
const stc4 = {
  styleDecls: [
    ["font-size", "12px", false],
    ["background", "blue", false],
    ["color", "red", false],
  ],
  key: 4,
};
const stc5 = {
  styleDecls: [
    ["font-size", "12px", false],
    ["background", "blue", false],
    ["color", "red", false],
  ],
  key: 5,
};
const stc6 = {
  styleDecls: [["background-color", "rgba(255,0,0,0.3)", false]],
  key: 6,
};
const stc7 = {
  styleDecls: [],
  key: 7,
};
const stc8 = {
  styleDecls: [],
  key: 8,
};
const stc9 = {
  styleDecls: [],
  key: 9,
};
const stc10 = {
  styleDecls: [],
  key: 10,
};
const stc11 = {
  styleDecls: [],
  key: 11,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", stc0),
    api_element("div", stc1),
    api_element("div", stc2),
    api_element("div", stc3),
    api_element("div", stc4),
    api_element("div", stc5),
    api_element("div", stc6),
    api_element("div", stc7),
    api_element("div", stc8),
    api_element("div", stc9),
    api_element("div", stc10),
    api_element("div", stc11),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2ubtal7ecmb";
tmpl.legacyStylesheetToken = "x-style_style";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
