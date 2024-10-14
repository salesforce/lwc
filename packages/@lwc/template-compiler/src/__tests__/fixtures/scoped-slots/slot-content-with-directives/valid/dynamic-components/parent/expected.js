import _implicitStylesheets from "./parent.css";
import _implicitScopedStylesheets from "./parent.scoped.css?scoped=true";
import _xChild from "x/child";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  slotAssignment: "header",
  key: 1,
};
const stc2 = {
  slotAssignment: "body",
  key: 2,
};
const stc3 = {
  slotAssignment: "footer",
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    dc: api_dynamic_component,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("", function (variations, key) {
        return api_fragment(
          key,
          [
            api_dynamic_component(variations.variation1, stc1),
            api_dynamic_component(variations.variation2, stc2),
            api_dynamic_component(variations.variation3, stc3),
          ],
          0
        );
      }),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-ts1rr7v761";
tmpl.legacyStylesheetToken = "x-parent_parent";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
