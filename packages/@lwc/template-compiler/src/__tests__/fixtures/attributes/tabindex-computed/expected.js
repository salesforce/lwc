import _implicitStylesheets from "./tabindex-computed.css";
import _implicitScopedStylesheets from "./tabindex-computed.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${"a0:tabindex"}${3}>valid</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    ti: api_tab_index,
    sp: api_static_part,
    st: api_static_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            tabindex: api_tab_index($cmp.computed),
          },
        },
        null
      ),
    ]),
    api_custom_element("x-foo", _xFoo, {
      props: {
        tabIndex: api_tab_index($cmp.computed),
      },
      key: 2,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-576tik9amt5";
tmpl.legacyStylesheetToken = "x-tabindex-computed_tabindex-computed";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
