import _implicitStylesheets from "./data-passing.css";
import _implicitScopedStylesheets from "./data-passing.scoped.css?scoped=true";
import _xTest from "x/test";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element("x-test", _xTest, {
      props: {
        abc: $cmp.def,
      },
      key: 0,
    }),
    api_element("x-test", {
      attrs: {
        ghi: $cmp.jkl,
      },
      key: 1,
      external: true,
    }),
    api_element("foo-bar", {
      attrs: {
        mno: $cmp.pqr,
      },
      key: 2,
      external: true,
    }),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-74096niamqs";
tmpl.legacyStylesheetToken = "x-data-passing_data-passing";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
