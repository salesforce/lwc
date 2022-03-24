import _xFoo from "x/foo";
import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, c: api_custom_element } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    attrs: {
      hidden: "",
    },
    key: 0,
  },
  [api_text("x")],
  true
);
const stc0 = {
  props: {
    autofocus: "true",
    autoplay: "true",
    capture: "true",
    checked: "true",
    disabled: "true",
    formnovalidate: "true",
    loop: "true",
    multiple: "true",
    muted: "true",
    noValidate: "true",
    open: "true",
    readOnly: "true",
    required: "true",
    reversed: "true",
    selected: "true",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    $hoisted1,
    api_custom_element("x-foo", _xFoo, stc0),
    api_element("input", {
      attrs: {
        readonly: $cmp.getReadOnly ? "" : null,
        disabled: "",
        title: "foo",
      },
      key: 2,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
