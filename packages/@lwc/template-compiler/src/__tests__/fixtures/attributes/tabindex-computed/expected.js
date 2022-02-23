import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    ti: api_tab_index,
    t: api_text,
    h: api_element,
    c: api_custom_element,
  } = $api;
  return [
    api_element(
      "p",
      {
        attrs: {
          tabindex: api_tab_index($cmp.computed),
        },
        key: 0,
      },
      [api_text("valid")]
    ),
    api_custom_element("x-foo", _xFoo, {
      props: {
        tabIndex: api_tab_index($cmp.computed),
      },
      key: 1,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
