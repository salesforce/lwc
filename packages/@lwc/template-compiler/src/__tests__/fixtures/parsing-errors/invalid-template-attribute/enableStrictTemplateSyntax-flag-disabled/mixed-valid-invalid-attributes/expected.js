import _implicitStylesheets from "./mixed-valid-invalid-attributes.css";
import _implicitScopedStylesheets from "./mixed-valid-invalid-attributes.scoped.css?scoped=true";
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
        return $cmp.showItems
          ? api_static_fragment($fragment1, api_key(2, item.id), [
              api_static_part(1, null, "1" + api_dynamic_text(item)),
            ])
          : null;
      })
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-37n02qqr3et";
tmpl.legacyStylesheetToken =
  "x-mixed-valid-invalid-attributes_mixed-valid-invalid-attributes";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
