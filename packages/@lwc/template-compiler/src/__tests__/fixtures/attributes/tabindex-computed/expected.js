import _xFoo from "x/foo";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    ti: api_tab_index,
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
        key: 1,
      },
      [api_text("valid", 0)]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          tabIndex: api_tab_index($cmp.computed),
        },
        key: 2,
      },
      []
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
