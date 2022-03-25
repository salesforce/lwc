import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 1,
  },
  [api_text("1")]
);
const $hoisted2 = api_text("2");
const $hoisted3 = api_element(
  "p",
  {
    key: 3,
  },
  [api_text("3")]
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
      api_set_owner($hoisted1),
      $cmp.bar ? api_element("p", stc1, [api_set_owner($hoisted2)]) : null,
      api_set_owner($hoisted3),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
