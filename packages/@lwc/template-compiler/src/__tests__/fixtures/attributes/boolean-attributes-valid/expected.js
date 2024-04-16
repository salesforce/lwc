import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p hidden${3}>x</p>`;
const $fragment2 = parseFragment`<input${"a0:readonly"} disabled title="foo"${3}>`;
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
    sp: api_static_part,
  } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_custom_element("x-foo", _xFoo, stc0),
    api_static_fragment($fragment2, 4, [
      api_static_part(
        0,
        {
          attrs: {
            readonly: $cmp.getReadOnly ? "" : null,
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
