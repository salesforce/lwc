import _implicitStylesheets from "./simple.css";
import _implicitScopedStylesheets from "./simple.scoped.css?scoped=true";
import _xChildWithNamedSlots from "x/childWithNamedSlots";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  slotAssignment: "slotname1",
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element,
    fr: api_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "x-child-with-named-slots",
      _xChildWithNamedSlots,
      stc0,
      [
        $cmp.condition
          ? api_fragment(
              1,
              [
                api_element("div", stc1, [
                  api_text("Named slot content from parent"),
                ]),
              ],
              0
            )
          : null,
      ]
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1lae0rspni6";
tmpl.legacyStylesheetToken = "x-simple_simple";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
