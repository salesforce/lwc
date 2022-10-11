import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Separator</div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 2,
};
const stc3 = [];
const stc4 = {
  key: 5,
};
const stc5 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, h: api_element, st: api_static_fragment } = $api;
  return [
    api_element("div", stc0, [
      api_element("div", stc1, [
        api_slot("conditional-slot", stc2, stc3, $slotset),
      ]),
    ]),
    api_static_fragment($fragment1(), 4),
    api_element("div", stc4, [
      api_slot("conditional-slot", stc5, stc3, $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["conditional-slot"];
tmpl.stylesheets = [];
