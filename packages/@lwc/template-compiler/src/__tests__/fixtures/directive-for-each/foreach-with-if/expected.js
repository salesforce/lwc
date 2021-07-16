import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_1(item) {
    function if2_0() {
      return api_element(
        "p",
        {
          key: api_key(1, item.id),
        },
        [api_text("1"), api_dynamic(item)]
      );
    }
    return $cmp.showItems ? if2_0() : null;
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
      api_iterator($cmp.items, foreach1_1)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
