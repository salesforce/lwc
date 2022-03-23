import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const stc0 = {
  attrs: {
    type: "checkbox",
    required: "",
    readonly: "",
    minlength: "5",
    maxlength: "10",
  },
  props: {
    checked: true,
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_element("input", stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
