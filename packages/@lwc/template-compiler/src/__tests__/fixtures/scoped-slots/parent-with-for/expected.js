import _implicitStylesheets from "./parent-with-for.css";
import _implicitScopedStylesheets from "./parent-with-for.scoped.css?scoped=true";
import _xList from "x/list";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment2 = parseFragment`<span${3}>${"t1"}</span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.parentItems, function (parentItem) {
    return api_custom_element(
      "x-list",
      _xList,
      {
        key: api_key(0, parentItem),
      },
      [
        api_scoped_slot_factory("", function (item, key) {
          return api_fragment(
            key,
            [
              api_static_fragment($fragment1, 2, [
                api_static_part(1, null, api_dynamic_text(parentItem)),
              ]),
              api_static_fragment($fragment2, 4, [
                api_static_part(
                  1,
                  null,
                  api_dynamic_text(item.id) +
                    " - " +
                    api_dynamic_text(item.name)
                ),
              ]),
            ],
            0
          );
        }),
      ]
    );
  });
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5cl44u45eun";
tmpl.legacyStylesheetToken = "x-parent-with-for_parent-with-for";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
