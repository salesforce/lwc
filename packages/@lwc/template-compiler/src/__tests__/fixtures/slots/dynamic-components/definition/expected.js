import _implicitStylesheets from "./definition.css";
import _implicitScopedStylesheets from "./definition.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    s: api_slot,
    dc: api_dynamic_component,
  } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_slot(
        "",
        stc1,
        [
          api_static_fragment($fragment1, "@:3", [
            api_static_part(1, null, api_dynamic_text($cmp.defaultContent)),
          ]),
        ],
        $slotset
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4ksn4idai2c";
tmpl.legacyStylesheetToken = "x-definition_definition";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
