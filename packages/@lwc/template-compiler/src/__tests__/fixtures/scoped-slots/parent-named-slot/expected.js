import _implicitStylesheets from "./parent-named-slot.css";
import _implicitScopedStylesheets from "./parent-named-slot.scoped.css?scoped=true";
import _xChild from "x/child";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
const $fragment2 = parseFragment`<p${3}>${"t1"}</p>`;
const $fragment3 = parseFragment`<p${3}>${"t1"}</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("slotname1", function (slot1data, key) {
        return api_fragment(
          key,
          [
            api_static_fragment($fragment1, 2, [
              api_static_part(1, null, api_dynamic_text(slot1data.name)),
            ]),
          ],
          0
        );
      }),
      api_scoped_slot_factory("slotname2", function (slot2data, key) {
        return api_fragment(
          key,
          [
            api_static_fragment($fragment2, 4, [
              api_static_part(1, null, api_dynamic_text(slot2data.title)),
            ]),
          ],
          0
        );
      }),
      api_scoped_slot_factory("", function (defaultdata, key) {
        return api_fragment(
          key,
          [
            api_static_fragment($fragment3, 6, [
              api_static_part(1, null, api_dynamic_text(defaultdata.title)),
            ]),
          ],
          0
        );
      }),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1f3m2kh4n8r";
tmpl.legacyStylesheetToken = "x-parent-named-slot_parent-named-slot";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
