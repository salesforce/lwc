import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_0(item) {
    const { other: $cv1_0 } = $cmp;
    return [
      api_element(
        "p",
        {
          key: api_key(1, item.keyOne),
        },
        [api_text("1"), api_dynamic(item)]
      ),
      api_element(
        "p",
        {
          key: api_key(2, item.keyTwo),
        },
        [api_text("2"), api_dynamic(item.foo)]
      ),
      api_element(
        "p",
        {
          key: api_key(3, item.keyThree),
        },
        [api_text("3"), api_dynamic($cv1_0)]
      ),
      api_element(
        "p",
        {
          key: api_key(4, item.keyFour),
        },
        [api_text("4"), api_dynamic($cv1_0.foo)]
      ),
    ];
  }
  const {
    k: api_key,
    t: api_text,
    d: api_dynamic,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      api_iterator($cmp.items, foreach1_0)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
