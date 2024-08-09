import _implicitStylesheets from "./components.css";
import _implicitScopedStylesheets from "./components.scoped.css?scoped=true";
import _cCustom from "c/custom";
import _cCustomElseif from "c/customElseif";
import _cCustomElse from "c/customElse";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = {
  key: 2,
};
const stc2 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_custom_element("c-custom", _cCustom, stc0)], 0)
      : $cmp.elseif
        ? api_fragment(
            0,
            [api_custom_element("c-custom-elseif", _cCustomElseif, stc1)],
            0
          )
        : api_fragment(
            0,
            [api_custom_element("c-custom-else", _cCustomElse, stc2)],
            0
          ),
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
