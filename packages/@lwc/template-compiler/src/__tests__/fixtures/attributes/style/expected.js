import { registerTemplate, renderApi } from "lwc";
const { h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "div",
  {
    styleDecls: [["color", "blue", false]],
    key: 0,
  },
  [],
  true
);
const $hoisted2 = api_element(
  "div",
  {
    styleDecls: [["color", "blue", false]],
    key: 1,
  },
  [],
  true
);
const $hoisted3 = api_element(
  "div",
  {
    styleDecls: [["color", "blue", false]],
    key: 2,
  },
  [],
  true
);
const $hoisted4 = api_element(
  "div",
  {
    styleDecls: [["box-shadow", "10px 5px 5px black", false]],
    key: 3,
  },
  [],
  true
);
const $hoisted5 = api_element(
  "div",
  {
    styleDecls: [
      ["font-size", "12px", false],
      ["background", "blue", false],
      ["color", "red", false],
    ],
    key: 4,
  },
  [],
  true
);
const $hoisted6 = api_element(
  "div",
  {
    styleDecls: [
      ["font-size", "12px", false],
      ["background", "blue", false],
      ["color", "red", false],
    ],
    key: 5,
  },
  [],
  true
);
const $hoisted7 = api_element(
  "div",
  {
    styleDecls: [["background-color", "rgba(255,0,0,0.3)", false]],
    key: 6,
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_set_owner($hoisted1),
    api_set_owner($hoisted2),
    api_set_owner($hoisted3),
    api_set_owner($hoisted4),
    api_set_owner($hoisted5),
    api_set_owner($hoisted6),
    api_set_owner($hoisted7),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
