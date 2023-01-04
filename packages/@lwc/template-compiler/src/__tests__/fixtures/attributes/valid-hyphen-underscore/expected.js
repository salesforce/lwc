import _xButton from "x/button";
import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    under_hyphen: "bar",
  },
  key: 0,
};
const stc1 = {
  props: {
    _leading: "bar",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-button", _xButton, stc0),
    api_custom_element("x-button", _xButton, stc1),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
