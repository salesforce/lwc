import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if1_0() {
    return [api_dynamic($cmp.foo), api_text(" "), api_dynamic($cmp.bar)];
  }
  const { d: api_dynamic, t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [...($cmp.isTrue ? if1_0() : [null, null, null])]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
