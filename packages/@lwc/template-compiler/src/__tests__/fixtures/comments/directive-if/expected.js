import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { truthyValue: $cv0_0 } = $cmp;
  function if2_0() {
    return [
      api_comment(" HTML comment inside if:false "),
      api_element(
        "p",
        {
          key: 1,
        },
        [api_text("false branch")]
      ),
    ];
  }
  function if1_0() {
    return [
      api_comment(" HTML comment inside if:true "),
      api_element(
        "p",
        {
          key: 0,
        },
        [api_text("true branch")]
      ),
    ];
  }
  const { co: api_comment, t: api_text, h: api_element } = $api;
  return [
    ...($cv0_0 ? if1_0() : [null, null]),
    ...(!$cv0_0 ? if2_0() : [null, null]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
