import _implicitStylesheets from "./expression.css";
import _implicitScopedStylesheets from "./expression.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"a0:spellcheck"}${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
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
            spellcheck: $cmp.spellCheck,
          },
        },
        null
      ),
    ]),
    api_custom_element("x-foo", _xFoo, {
      props: {
        spellcheck: $cmp.spellCheck,
      },
      key: 2,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-602vdkaauac";
tmpl.legacyStylesheetToken = "x-expression_expression";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
