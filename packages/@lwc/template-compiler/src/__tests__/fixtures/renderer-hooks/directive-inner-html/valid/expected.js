import _implicitStylesheets from "./valid.css";
import _implicitScopedStylesheets from "./valid.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate, renderer } from "lwc";
const stc0 = {
  innerHTML: "Hello <b>world</b>!",
};
const stc1 = {
  lwc: {
    dom: "manual",
  },
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", {
      props: stc0,
      context: stc1,
      key: 0,
      renderer: renderer,
    }),
    api_element("div", {
      props: {
        innerHTML: $cmp.greeting,
      },
      context: stc1,
      key: 1,
      renderer: renderer,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2jeqhu792ub";
tmpl.legacyStylesheetToken = "x-valid_valid";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
