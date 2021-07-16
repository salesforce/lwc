import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { data: $cv0_0 } = $cmp;
  function if1_1() {
    function if2_0() {
      return api_element(
        "p",
        {
          key: 0,
        },
        [api_dynamic($cv0_0.content)]
      );
    }
    return $cmp.foo ? if2_0() : null;
  }
  const { d: api_dynamic, h: api_element } = $api;
  return [$cv0_0 ? if1_1() : null];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
