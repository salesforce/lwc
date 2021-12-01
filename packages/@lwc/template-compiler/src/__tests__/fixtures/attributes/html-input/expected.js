import { registerTemplate } from "lwc";
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
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("input", stc0, stc1)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
