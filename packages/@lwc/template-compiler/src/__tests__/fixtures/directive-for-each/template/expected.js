import _implicitStylesheets from "./template.css";
import _implicitScopedStylesheets from "./template.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_static_fragment($fragment1, api_key(2, item.id), [
          api_static_part(1, null, "1" + api_dynamic_text(item)),
        ]);
      })
    ),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2it5vhebv0i";
tmpl.legacyStylesheetToken = "x-template_template";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
