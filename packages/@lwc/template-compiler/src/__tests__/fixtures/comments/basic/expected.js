import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, t: api_text, h: api_element } = $api;
  return [
    api_comment(" This is an HTML comment "),
    api_element(
      "button",
      {
        key: 0,
      },
      [api_text("click me")]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
