import { registerTemplate } from "lwc";
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
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
