import _implicitStylesheets from "./components.css";
import _implicitScopedStylesheets from "./components.scoped.css?scoped=true";
import _cCustom from "c/custom";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, c: api_custom_element, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          [
            api_custom_element("c-custom", _cCustom, stc0, [
              api_text("Visible Header"),
            ]),
          ],
          0
        )
      : $cmp.elseifCondition
        ? api_fragment(
            0,
            [
              api_custom_element("c-custom", _cCustom, stc1, [
                api_text("First Alternative Header"),
              ]),
            ],
            0
          )
        : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1j5adk6vpb3";
tmpl.legacyStylesheetToken = "x-components_components";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
