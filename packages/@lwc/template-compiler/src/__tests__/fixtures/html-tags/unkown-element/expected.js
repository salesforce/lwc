import _implicitStylesheets from "./unkown-element.css";
import _implicitScopedStylesheets from "./unkown-element.scoped.css?scoped=true";
import _xCustomComponent from "x/customComponent";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<unknonwtag${3}></unknonwtag>`;
const $fragment2 = parseFragment`<span${3}>valid tags should not warn</span>`;
const $fragment3 = parseFragment`<spam${3}>this tag has a typo</spam>`;
const stc0 = {
  props: {
    someTruthyValue: true,
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, c: api_custom_element } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_custom_element("x-custom-component", _xCustomComponent, stc0),
    api_static_fragment($fragment2, 4),
    api_static_fragment($fragment3, 6),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-616604d1ker";
tmpl.legacyStylesheetToken = "x-unkown-element_unkown-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
