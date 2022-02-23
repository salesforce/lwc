import { registerTemplate } from "lwc";
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
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
