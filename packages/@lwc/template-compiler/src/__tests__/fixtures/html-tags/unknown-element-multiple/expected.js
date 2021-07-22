import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, t: api_text } = $api;
  return [
    api_element(
      "tr",
      {
        key: 0,
      },
      []
    ),
    api_element(
      "unknown",
      {
        key: 1,
      },
      []
    ),
    api_element(
      "div",
      {
        key: 2,
      },
      [api_text("valid HTML in between")]
    ),
    api_element(
      "unknownother",
      {
        key: 3,
      },
      []
    ),
    api_element(
      "unknown",
      {
        key: 4,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
