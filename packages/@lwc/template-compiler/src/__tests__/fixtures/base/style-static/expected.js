import { registerTemplate, renderApi } from "lwc";
const { h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "section",
  {
    styleDecls: [
      ["font-size", "12px", false],
      ["color", "red", false],
      ["margin", "10px 5px 10px", false],
    ],
    key: 0,
  },
  [],
  true
);
const $hoisted2 = api_element(
  "section",
  {
    styleDecls: [
      ["--my-color", "blue", false],
      ["color", "var(--my-color)", false],
    ],
    key: 1,
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_set_owner($hoisted1), api_set_owner($hoisted2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
