import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
const stc0 = ["valid"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ti: api_tab_index, h: api_element, c: api_custom_element } = $api;
  return [
    api_element(
      "p",
      {
        attrs: {
          tabindex: api_tab_index($cmp.computed),
        },
        key: 0,
      },
      stc0,
      160
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          tabIndex: api_tab_index($cmp.computed),
        },
        key: 1,
      },
      undefined,
      64
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
