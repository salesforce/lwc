import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const $hoisted1 = api_element(
  "input",
  {
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
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
