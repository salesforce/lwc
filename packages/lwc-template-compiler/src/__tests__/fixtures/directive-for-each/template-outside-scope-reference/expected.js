import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    d: api_dynamic,
    k: api_key,
    h: api_element,
    i: api_iterator
  } = $api;

  return [
    api_element(
      "section",
      {
        key: 2
      },
      api_iterator($cmp.items, function(item) {
        return [
          api_element(
            "p",
            {
              key: api_key(4, item.keyOne)
            },
            [api_text("1"), api_dynamic(item)]
          ),
          api_element(
            "p",
            {
              key: api_key(5, item.keyTwo)
            },
            [api_text("2"), api_dynamic(item.foo)]
          ),
          api_element(
            "p",
            {
              key: api_key(6, item.keyThree)
            },
            [api_text("3"), api_dynamic($cmp.other)]
          ),
          api_element(
            "p",
            {
              key: api_key(7, item.keyFour)
            },
            [api_text("4"), api_dynamic($cmp.other.foo)]
          )
        ];
      })
    )
  ];
}

export default registerTemplate(tmpl);
