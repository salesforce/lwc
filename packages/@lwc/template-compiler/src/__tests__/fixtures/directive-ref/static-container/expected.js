import _implicitStylesheets from "./static-container.css";
import _implicitScopedStylesheets from "./static-container.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><span${3}></span></div>`;
const stc0 = {
  ref: "foo",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1, [api_static_part(1, stc0, null)])];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7160slcn7bl";
tmpl.legacyStylesheetToken = "x-static-container_static-container";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
