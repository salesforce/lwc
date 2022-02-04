import _xCustomComponent from "x/customComponent";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = [];
const stc2 = {
  props: {
    someTruthyValue: true,
  },
  key: 1,
};
const stc3 = {
  key: 2,
};
const stc4 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element, t: api_text } = $api;
  return [
    api_element("unknonwtag", stc0, stc1),
    api_custom_element("x-custom-component", _xCustomComponent, stc2, stc1),
    api_element("span", stc3, [api_text("valid tags should not warn")]),
    api_element("spam", stc4, [api_text("this tag has a typo")]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
