import _implicitStylesheets from "./arrowfn-scoped-vars.css";
import _implicitScopedStylesheets from "./arrowfn-scoped-vars.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-pert", _xPert, {
      props: {
        foo: [
          $cmp.foo,
          (foo) => foo,
          $cmp.foo,
          [(foo) => [foo, (foo) => foo, foo], $cmp.foo],
        ],
      },
      key: 0,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4jav1e64a2p";
tmpl.legacyStylesheetToken = "x-arrowfn-scoped-vars_arrowfn-scoped-vars";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
