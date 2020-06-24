import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    d: api_dynamic,
    k: api_key,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "section",
      {
        key: 12,
      },
      api_iterator($cmp.items, function (item) {
        return [
          api_element(
            "p",
            {
              key: api_key(2, item.keyOne),
            },
            [api_text("1", 0), api_dynamic(item, 1)]
          ),
          api_element(
            "p",
            {
              key: api_key(5, item.keyTwo),
            },
            [api_text("2", 3), api_dynamic(item.foo, 4)]
          ),
          api_element(
            "p",
            {
              key: api_key(8, item.keyThree),
            },
            [api_text("3", 6), api_dynamic($cmp.other, 7)]
          ),
          api_element(
            "p",
            {
              key: api_key(11, item.keyFour),
            },
            [api_text("4", 9), api_dynamic($cmp.other.foo, 10)]
          ),
        ];
      })
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
