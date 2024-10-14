import _implicitStylesheets from "./dynamic-component.css";
import _implicitScopedStylesheets from "./dynamic-component.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    dc: api_dynamic_component,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_dynamic_component(
      $cmp.ctor,
      {
        key: api_key(0, item.id),
      },
      [
        api_static_fragment($fragment1, 2, [
          api_static_part(1, null, api_dynamic_text(item)),
        ]),
      ]
    );
  });
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2aur4v16kjs";
tmpl.legacyStylesheetToken = "x-dynamic-component_dynamic-component";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
