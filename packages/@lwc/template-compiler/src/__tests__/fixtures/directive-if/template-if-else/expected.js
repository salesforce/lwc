import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if2_0() {
    return api_element(
      "p",
      {
        key: 1,
      },
      [api_text("2")]
    );
  }
  function if1_0() {
    return api_element(
      "p",
      {
        key: 0,
      },
      [api_text("1")]
    );
  }
  const { t: api_text, h: api_element } = $api;
  return [$cmp.isTrue ? if1_0() : null, !$cmp.isTrue2 ? if2_0() : null];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
