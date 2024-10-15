import _implicitStylesheets from "./false-value.css";
import _implicitScopedStylesheets from "./false-value.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    spellcheck: false,
  },
  key: 0,
};
const stc1 = {
  props: {
    spellcheck: false,
  },
  key: 1,
};
const stc2 = {
  props: {
    spellcheck: false,
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_custom_element("x-foo", _xFoo, stc1),
    api_custom_element("x-foo", _xFoo, stc2),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4oh91tt7sup";
tmpl.legacyStylesheetToken = "x-false-value_false-value";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
