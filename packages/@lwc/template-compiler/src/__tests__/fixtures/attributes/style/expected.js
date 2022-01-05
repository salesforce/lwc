import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        styleDecls: [["color", "blue", false]],
        key: 0,
      },
      []
    ),
    api_element(
      "div",
      {
        styleDecls: [["color", "blue", false]],
        key: 1,
      },
      []
    ),
    api_element(
      "div",
      {
        styleDecls: [["color", "blue", false]],
        key: 2,
      },
      []
    ),
    api_element(
      "div",
      {
        styleDecls: [["box-shadow", "10px 5px 5px black", false]],
        key: 3,
      },
      []
    ),
    api_element(
      "div",
      {
        styleDecls: [
          ["font-size", "12px", false],
          ["background", "blue", false],
          ["color", "red", false],
        ],
        key: 4,
      },
      []
    ),
    api_element(
      "div",
      {
        styleDecls: [
          ["font-size", "12px", false],
          ["background", "blue", false],
          ["color", "red", false],
        ],
        key: 5,
      },
      []
    ),
    api_element(
      "div",
      {
        styleDecls: [["background-color", "rgba(255,0,0,0.3)", false]],
        key: 6,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
