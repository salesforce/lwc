import _xCustomComponent from "x/customComponent";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  props: {
    someTruthyValue: true,
  },
  key: 1,
};
const stc2 = {
  key: 2,
};
const stc3 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element, t: api_text } = $api;
  return [
    api_element("unknonwtag", stc0),
    api_custom_element("x-custom-component", _xCustomComponent, stc1),
    api_element("span", stc2, [api_text("valid tags should not warn")]),
    api_element("spam", stc3, [api_text("this tag has a typo")]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
