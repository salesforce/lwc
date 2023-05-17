import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Root</p>`;
const stc0 = {
  key: 2,
};
const stc1 = ["Default"];
const stc2 = {
  attrs: {
    name: "named",
  },
  key: 3,
};
const stc3 = ["Named"];
const stc4 = {
  attrs: {
    name: "forwarded",
    slot: "forward",
  },
  key: 4,
};
const stc5 = ["Forwarded"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, s: api_slot, f: api_flatten } = $api;
  return api_flatten([
    api_static_fragment($fragment1(), 1),
    api_slot("", stc0, stc1, $slotset),
    api_slot("named", stc2, stc3, $slotset),
    api_slot("forwarded", stc4, stc5, $slotset),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "forwarded", "named"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
