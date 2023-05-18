import { registerTemplate, renderer } from "lwc";
const stc0 = {
  city: true,
};
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
      "Should get custom renderer",
      132
    ),
    api_element(
      "div",
      {
        key: 1,
        renderer: renderer,
      },
      "Should also get custom renderer",
      128
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
