import _implicitStylesheets from "./literal-value-starting-with-hash.css";
import _implicitScopedStylesheets from "./literal-value-starting-with-hash.scoped.css?scoped=true";
import {
  freezeTemplate,
  parseFragment,
  registerTemplate,
  sanitizeAttribute,
} from "lwc";
const $fragment1 = parseFragment`<svg aria-hidden="true" class="slds-icon${0}" title="when needed"${2}><use${"a1:xlink:href"}${3}/></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    fid: api_scoped_frag_id,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        {
          attrs: {
            "xlink:href": sanitizeAttribute(
              "use",
              "http://www.w3.org/2000/svg",
              "xlink:href",
              api_scoped_frag_id("#case")
            ),
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-p1v8cfa11m";
tmpl.legacyStylesheetToken =
  "x-literal-value-starting-with-hash_literal-value-starting-with-hash";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
