import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const $hoisted1 = api_element(
  "section",
  {
    key: 0,
  },
  [
    api_element("color-profile", {
      attrs: {
        local: "x",
      },
      key: 1,
    }),
  ],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
