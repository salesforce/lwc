import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { isTrue: $cv0_0 } = $cmp;
  function if3_0() {
    return api_element(
      "p",
      {
        key: 3,
      },
      [api_text("3")]
    );
  }
  function if2_0() {
    return api_element(
      "p",
      {
        key: 2,
      },
      [api_text("2")]
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
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [
        $cv0_0 ? if1_0() : null,
        $cv0_0 ? if2_0() : null,
        $cv0_0 ? if3_0() : null,
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
