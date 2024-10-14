import _implicitStylesheets from "./boolean-literal.css";
import _implicitScopedStylesheets from "./boolean-literal.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  props: {
    attr: true,
  },
  key: 1,
};
const stc2 = {
  props: {
    attr: false,
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, stc1, [
        api_text(api_dynamic_text(true)),
      ]),
      api_custom_element("x-pert", _xPert, stc2, [
        api_text(api_dynamic_text(false)),
      ]),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-34ejl9uakkr";
tmpl.legacyStylesheetToken = "x-boolean-literal_boolean-literal";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
