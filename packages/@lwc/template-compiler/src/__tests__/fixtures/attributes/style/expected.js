import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        styleDecls: [["color", "blue", false]],
        key: 0,
      },
      stc0
    ),
    api_element(
      "div",
      {
        styleDecls: [["color", "blue", false]],
        key: 1,
      },
      stc0
    ),
    api_element(
      "div",
      {
        styleDecls: [["color", "blue", false]],
        key: 2,
      },
      stc0
    ),
    api_element(
      "div",
      {
        styleDecls: [["box-shadow", "10px 5px 5px black", false]],
        key: 3,
      },
      stc0
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
      stc0
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
      stc0
    ),
    api_element(
      "div",
      {
        styleDecls: [["background-color", "rgba(255,0,0,0.3)", false]],
        key: 6,
      },
      stc0
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
