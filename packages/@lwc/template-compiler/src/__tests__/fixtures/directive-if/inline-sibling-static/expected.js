import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { isTrue: $cv0_0 } = $cmp;
  function if2_0() {
    return api_element(
      "p",
      {
        key: 2,
      },
      [api_text("3")]
    );
  }
  function if1_0() {
    return api_element(
      "p",
      {
        key: 1,
      },
      [api_text("1")]
    );
  }
  const { t: api_text, h: api_element, d: api_dynamic } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [$cv0_0 ? if1_0() : null, api_dynamic($cmp.foo), $cv0_0 ? if2_0() : null]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
