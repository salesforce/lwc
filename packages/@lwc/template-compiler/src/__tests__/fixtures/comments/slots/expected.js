import _xChild from "x/child";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    co: api_comment,
    t: api_text,
    h: api_element,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "x-child",
      _xChild,
      {
        key: 0,
      },
      [
        api_comment(" HTML comment inside slot "),
        api_element(
          "p",
          {
            key: 1,
          },
          [api_text("slot content")]
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
