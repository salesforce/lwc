import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 1,
  svg: true,
};
const stc2 = {
  key: 2,
  svg: true,
};
const stc3 = {
  key: 3,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      stc0,
      [
        api_element(
          "svg",
          stc1,
          [
            api_element("path", stc2, undefined, 0),
            api_element("path", stc3, undefined, 0),
          ],
          72
        ),
      ],
      64
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
