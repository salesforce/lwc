import { registerTemplate, renderer } from "lwc";
const stc0 = {
  city: true,
};
const stc1 = ["Should get custom renderer"];
const stc2 = ["Should also get custom renderer"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        classMap: stc0,
        key: 0,
        renderer: renderer,
      },
      stc1,
      132
    ),
    api_element(
      "div",
      {
        key: 1,
        renderer: renderer,
      },
      stc2,
      128
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
