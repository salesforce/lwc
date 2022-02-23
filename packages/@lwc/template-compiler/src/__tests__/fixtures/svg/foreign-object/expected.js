import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    width: "706",
    height: "180",
  },
  key: 1,
  svg: true,
};
const stc2 = {
  attrs: {
    transform: "translate(3,3)",
  },
  key: 2,
  svg: true,
};
const stc3 = {
  attrs: {
    transform: "translate(250,0)",
  },
  key: 3,
  svg: true,
};
const stc4 = {
  attrs: {
    width: "200",
    height: "36",
    "xlink:href": "javascript:alert(1)",
  },
  key: 4,
  svg: true,
};
const stc5 = {
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("div", stc0, [
      api_element("svg", stc1, [
        api_element("g", stc2, [
          api_element("g", stc3, [
            api_element("foreignObject", stc4, [
              api_element("a", stc5, [api_text("x")]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
