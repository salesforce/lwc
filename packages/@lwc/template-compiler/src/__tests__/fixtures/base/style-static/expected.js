import { registerTemplate } from "lwc";
const stc0 = {
  styleDecls: [
    ["font-size", "12px", false],
    ["color", "red", false],
    ["margin", "10px 5px 10px", false],
  ],
  key: 0,
};
const stc1 = {
  styleDecls: [
    ["--my-color", "blue", false],
    ["color", "var(--my-color)", false],
  ],
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("section", stc0), api_element("section", stc1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
