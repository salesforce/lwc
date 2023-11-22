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
const stc2 = {
  slotAssignment: "forward",
  attrs: {
    name: "forwarded",
  },
  key: 4,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, t: api_text, s: api_slot } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_slot("", stc0, [api_text("Default")], $slotset),
    api_slot("named", stc1, [api_text("Named")], $slotset),
    api_slot("forwarded", stc2, [api_text("Forwarded")], $slotset),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "forwarded", "named"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
