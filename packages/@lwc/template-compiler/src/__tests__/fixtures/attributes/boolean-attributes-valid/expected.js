import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p hidden${3}>x</p>`;
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
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_custom_element("x-foo", _xFoo, stc0),
    api_element("input", {
      attrs: {
        readonly: $cmp.getReadOnly ? "" : null,
        disabled: "",
        title: "foo",
      },
      key: 3,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
