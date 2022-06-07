import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Root</p>`;
const stc0 = {
  key: 2,
};
const stc1 = {
  attrs: {
    name: "named",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    s: api_slot,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_static_fragment($fragment1(), 1),
    api_slot("", stc0, [api_text("Default")], $slotset),
    api_slot("named", stc1, [api_text("Named")], $slotset),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "named"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
