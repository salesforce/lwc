import { registerTemplate, renderer } from "lwc";
const stc0 = {
  innerHTML: "Hello <b>world</b>!",
};
const stc1 = {
  lwc: {
    dom: "manual",
  },
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        props: stc0,
        context: stc1,
        key: 0,
        renderer: renderer,
      },
      undefined,
      64
    ),
    api_element(
      "div",
      {
        props: {
          innerHTML: $cmp.greeting,
        },
        context: stc1,
        key: 1,
        renderer: renderer,
      },
      undefined,
      64
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
