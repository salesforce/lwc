import _implicitStylesheets from "./same-branch-condition-tree.css";
import _implicitScopedStylesheets from "./same-branch-condition-tree.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "nested-slot",
  },
  key: 1,
};
const stc1 = [];
const stc2 = {
  key: 2,
};
const stc3 = {
  attrs: {
    name: "nested-slot",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, h: api_element, fr: api_fragment, t: api_text } = $api;
  return [
    $cmp.condition
      ? api_fragment(
          0,
          [
            api_slot("nested-slot", stc0, stc1, $slotset),
            api_element("div", stc2, [
              api_slot("nested-slot", stc3, stc1, $slotset),
            ]),
          ],
          0
        )
      : api_fragment(0, [api_text("Alternative Text")], 0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["nested-slot"];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7498dhinp2o";
tmpl.legacyStylesheetToken =
  "x-same-branch-condition-tree_same-branch-condition-tree";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
