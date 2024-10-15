import _implicitStylesheets from "./expression-value.css";
import _implicitScopedStylesheets from "./expression-value.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate, sanitizeAttribute } from "lwc";
const stc0 = {
  classMap: {
    "slds-icon": true,
  },
  attrs: {
    "aria-hidden": "true",
    title: "when needed",
  },
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { fid: api_scoped_frag_id, h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_element("use", {
        attrs: {
          "xlink:href": sanitizeAttribute(
            "use",
            "http://www.w3.org/2000/svg",
            "xlink:href",
            api_scoped_frag_id($cmp.getXLink)
          ),
        },
        key: 1,
        svg: true,
      }),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-16tq0ukvc6u";
tmpl.legacyStylesheetToken = "x-expression-value_expression-value";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
