import { parseFragment, registerTemplate, renderer } from "lwc";
const $fragment1 = parseFragment`<div${3}>Should not get custom renderer</div>`;
const stc0 = {
  city: true,
};
const stc1 = ["Should get custom renderer"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, st: api_static_fragment } = $api;
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
    api_static_fragment($fragment1(), 2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
