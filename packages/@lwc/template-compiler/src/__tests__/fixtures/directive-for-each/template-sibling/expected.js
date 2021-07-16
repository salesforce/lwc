import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_0(item) {
    return [
      api_element(
        "p",
        {
          key: api_key(1, item.id),
        },
        [api_text("1"), api_dynamic(item)]
      ),
      api_element(
        "p",
        {
          key: api_key(2, item.secondId),
        },
        [api_text("2"), api_dynamic(item)]
      ),
    ];
  }
  const {
    k: api_key,
    t: api_text,
    d: api_dynamic,
    h: api_element,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      api_flatten([
        api_iterator($cmp.items, foreach1_0),
        api_element(
          "p",
          {
            key: 3,
          },
          [api_text("3"), api_dynamic($cmp.item)]
        ),
      ])
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
