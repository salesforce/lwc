import _implicitStylesheets from "./usage-named.css";
import _implicitScopedStylesheets from "./usage-named.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Test slot content</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "test",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, s: api_slot, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_slot(
        "test",
        stc1,
        [api_static_fragment($fragment1, "@test:3")],
        $slotset
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["test"];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2ok8npp45is";
tmpl.legacyStylesheetToken = "x-usage-named_usage-named";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
