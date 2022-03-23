import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const stc0 = {
  styleDecls: [
    ["background", "blue", true],
    ["color", "red", false],
    ["opacity", "0.5", true],
  ],
  key: 0,
};
function tmpl($cmp, $slotset, $ctx) {
  return [api_element("div", stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
