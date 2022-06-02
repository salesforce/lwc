import { registerTemplate, renderer } from "lwc";
const stc0 = {
  city: true,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
const stc3 = [["color", "blue", false]];
const stc4 = {
  key: 5,
};
const stc5 = {
  key: 6,
};
const stc6 = {
  classMap: {
    bold: true,
  },
  key: 7,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        classMap: stc0,
        key: 0,
        renderer: renderer,
      },
      [
        api_element("h2", stc1, [api_text("London")]),
        api_element("p", stc2, [
          api_text("London is the capital of "),
          api_element(
            "span",
            {
              styleDecls: stc3,
              key: 3,
              renderer: renderer,
            },
            [api_text("England.")]
          ),
        ]),
      ]
    ),
    api_element(
      "div",
      {
        classMap: stc0,
        key: 4,
        renderer: renderer,
      },
      [
        api_element("h2", stc4, [api_text("Paris")]),
        api_element("p", stc5, [
          api_text("Paris is the capital of "),
          api_element("span", stc6, [api_text("France.")]),
        ]),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
