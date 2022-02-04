import { registerTemplate } from "lwc";
const stc0 = {
  styleDecls: [["color", "blue", false]],
  key: 0,
};
const stc1 = [];
const stc2 = {
  styleDecls: [["color", "blue", false]],
  key: 1,
};
const stc3 = {
  styleDecls: [["color", "blue", false]],
  key: 2,
};
const stc4 = {
  styleDecls: [["box-shadow", "10px 5px 5px black", false]],
  key: 3,
};
const stc5 = {
  styleDecls: [
    ["font-size", "12px", false],
    ["background", "blue", false],
    ["color", "red", false],
  ],
  key: 4,
};
const stc6 = {
  styleDecls: [
    ["font-size", "12px", false],
    ["background", "blue", false],
    ["color", "red", false],
  ],
  key: 5,
};
const stc7 = {
  styleDecls: [["background-color", "rgba(255,0,0,0.3)", false]],
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", stc0, stc1),
    api_element("div", stc2, stc1),
    api_element("div", stc3, stc1),
    api_element("div", stc4, stc1),
    api_element("div", stc5, stc1),
    api_element("div", stc6, stc1),
    api_element("div", stc7, stc1),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
