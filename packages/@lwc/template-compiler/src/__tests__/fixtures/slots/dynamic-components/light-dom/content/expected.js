import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "head",
  },
  key: 0,
};
const stc1 = {
  key: "@head:1",
};
const stc2 = {
  attrs: {
    name: "body",
  },
  key: 2,
};
const stc3 = {
  key: "@body:3",
};
const stc4 = {
  attrs: {
    name: "footer",
  },
  key: 4,
};
const stc5 = {
  key: "@footer:5",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component, s: api_slot } = $api;
  return [
    api_slot("head", stc0, [api_dynamic_component($cmp.ctor, stc1)], $slotset),
    api_slot("body", stc2, [api_dynamic_component($cmp.ctor, stc3)], $slotset),
    api_slot(
      "footer",
      stc4,
      [api_dynamic_component($cmp.ctor, stc5)],
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["body", "footer", "head"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
