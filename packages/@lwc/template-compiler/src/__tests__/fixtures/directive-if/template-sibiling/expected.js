import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 1,
  },
  [api_text("1")],
  true
);
const $hoisted2 = api_element(
  "p",
  {
    key: 3,
  },
  [api_text("3")],
  true
);
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [
      $hoisted1,
      $cmp.bar ? api_element("p", stc1, [api_text("2")]) : null,
      $hoisted2,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
