import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        styleDecls: [
          ["font-size", "12px", false],
          ["color", "red", false],
          ["margin", "10px 5px 10px", false],
        ],
        key: 0,
      },
      stc0
    ),
    api_element(
      "section",
      {
        styleDecls: [
          ["--my-color", "blue", false],
          ["color", "var(--my-color)", false],
        ],
        key: 1,
      },
      stc0
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
