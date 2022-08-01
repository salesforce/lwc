import { registerTemplate, renderer } from "lwc";
const stc0 = {
  city: true,
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
      [api_text("Should get custom renderer")]
    ),
    api_element(
      "div",
      {
        key: 1,
        renderer: renderer,
      },
      [api_text("Should also get custom renderer")]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
