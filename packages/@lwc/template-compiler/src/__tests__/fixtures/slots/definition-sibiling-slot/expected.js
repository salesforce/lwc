import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  h: api_element,
  so: api_set_owner,
  s: api_slot,
} = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 2,
  },
  [api_text("Default slot other content")],
  true
);
const $hoisted2 = api_element(
  "p",
  {
    key: 4,
  },
  [api_text("Default slot content")],
  true
);
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "other",
  },
  key: 1,
};
const stc2 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [
      api_slot("other", stc1, [api_set_owner($hoisted1)], $slotset),
      api_slot("", stc2, [api_set_owner($hoisted2)], $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "other"];
tmpl.stylesheets = [];
