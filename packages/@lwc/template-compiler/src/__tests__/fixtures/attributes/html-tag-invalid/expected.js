import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element } = renderApi;
const $hoisted1 = api_element(
  "section",
  {
    key: 0,
  },
  [
    api_element(
      "textarea",
      {
        attrs: {
          minlength: "1",
          maxlength: "5",
          "unknown-attr": "should-error",
        },
        key: 1,
      },
      [api_text("x")]
    ),
  ],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
