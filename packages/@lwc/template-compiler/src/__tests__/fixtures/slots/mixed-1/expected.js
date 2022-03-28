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
    key: 1,
    isStatic: true,
  },
  [api_text("Before header")]
);
const $hoisted2 = api_text("Default header");
const $hoisted3 = api_element(
  "p",
  {
    key: 3,
    isStatic: true,
  },
  [api_text("In")]
);
const $hoisted4 = api_element(
  "p",
  {
    key: 4,
    isStatic: true,
  },
  [api_text("between")]
);
const $hoisted5 = api_element(
  "p",
  {
    key: 6,
    isStatic: true,
  },
  [api_text("Default body")]
);
const $hoisted6 = api_element(
  "p",
  {
    key: 8,
    isStatic: true,
  },
  [api_text("Default footer")]
);
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "header",
  },
  key: 2,
};
const stc2 = {
  key: 5,
};
const stc3 = {
  attrs: {
    name: "footer",
  },
  key: 7,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [
      api_set_owner($hoisted1),
      api_slot("header", stc1, [api_set_owner($hoisted2)], $slotset),
      api_set_owner($hoisted3),
      api_set_owner($hoisted4),
      api_slot("", stc2, [api_set_owner($hoisted5)], $slotset),
      api_slot("footer", stc3, [api_set_owner($hoisted6)], $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "footer", "header"];
tmpl.stylesheets = [];
