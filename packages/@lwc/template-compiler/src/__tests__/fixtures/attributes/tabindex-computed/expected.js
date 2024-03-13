import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${"a0:tabindex"}${3}>valid</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    ti: api_tab_index,
    sp: api_static_part,
    st: api_static_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_static_fragment($fragment1, 0, [
      api_static_part(0, {
        attrs: {
          tabindex: api_tab_index($cmp.computed),
        },
      }),
    ]),
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
