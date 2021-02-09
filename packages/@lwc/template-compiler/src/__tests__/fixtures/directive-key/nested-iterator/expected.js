import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    d: api_dynamic,
    h: api_element,
    k: api_key,
    i: api_iterator
  } = $api;
  return [
    api_element(
      "section",
      {
        key: 3,
      },
      api_iterator($cmp.items, function (xValue, xIndex, xFirst, xLast) {
        const x = {
          value: xValue,
          index: xIndex,
          first: xFirst,
          last: xLast,
        };
        return [
          api_element(
            "div",
            {
              attrs: {
                "data-islast": x.last,
                "data-isfirst": x.first,
              },
              key: api_key(1, x.value.id)
            },
            [
              api_element(
                "span",
                {
                  key: 0
                },
                [api_text("Row: "), api_dynamic(x.index)]
              ),
              api_text(". Value: "),
              api_dynamic(x.value)
            ]
          ),
          $cmp.isTrue
            ? api_element(
                "div",
                {
                  key: api_key(2, x.value.key)
                },
                [api_text("Text")]
              )
            : null
        ];
      })
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
