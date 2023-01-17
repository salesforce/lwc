import _xButton from "x/button";
import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    foo__bar: "underscore",
  },
  key: 0,
};
const stc1 = {
  props: {
    foo__3ar: "underscore",
  },
  key: 1,
};
const stc2 = {
  props: {
    fo0__bar: "underscore",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-button", _xButton, stc0),
    api_custom_element("x-button", _xButton, stc1),
    api_custom_element("x-button", _xButton, stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
