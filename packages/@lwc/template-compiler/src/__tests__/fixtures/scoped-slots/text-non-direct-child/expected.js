import _implicitStylesheets from "./text-non-direct-child.css";
import _implicitScopedStylesheets from "./text-non-direct-child.scoped.css?scoped=true";
import _xList from "x/list";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>${"t1"}</span>`;
const $fragment2 = parseFragment`<div${3}>Content from parent&#x27;s template</div>`;
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
    api_custom_element("x-list", _xList, stc0, [
      api_scoped_slot_factory("", function (item, key) {
        return api_fragment(
          key,
          [
            api_static_fragment($fragment1, 2, [
              api_static_part(
                1,
                null,
                api_dynamic_text(item.id) + " - " + api_dynamic_text(item.name)
              ),
            ]),
            api_static_fragment($fragment2, 4),
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
tmpl.stylesheetToken = "lwc-7snm06k811b";
tmpl.legacyStylesheetToken = "x-text-non-direct-child_text-non-direct-child";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
