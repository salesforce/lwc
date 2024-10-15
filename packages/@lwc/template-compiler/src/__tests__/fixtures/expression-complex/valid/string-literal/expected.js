import _implicitStylesheets from "./string-literal.css";
import _implicitScopedStylesheets from "./string-literal.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  props: {
    attr: "foo",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, c: api_custom_element, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, stc1, [api_text("foo foo")]),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-76sj5dn4mci";
tmpl.legacyStylesheetToken = "x-string-literal_string-literal";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
