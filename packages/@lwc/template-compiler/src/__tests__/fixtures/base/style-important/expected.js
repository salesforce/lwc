import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        styleDecls: [
          ["background", "blue", true],
          ["color", "red", false],
          ["opacity", "0.5", true],
        ],
        key: 0,
      },
      stc0
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
