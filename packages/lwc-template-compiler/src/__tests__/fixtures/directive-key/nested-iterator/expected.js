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
        key: 2
      },
      api_iterator($cmp.items, function(xValue, xIndex, xFirst, xLast) {
        return [
          api_element(
            "div",
            {
              attrs: {
                "data-islast": xLast,
                "data-isfirst": xFirst
              },
              key: api_key(4, xValue.id)
            },
            [
              api_element(
                "span",
                {
                  key: 5
                },
                [api_text("Row: "), api_dynamic(xIndex)]
              ),
              api_text(". Value: "),
              api_dynamic(xValue)
            ]
          ),
          $cmp.isTrue
            ? api_element(
                "div",
                {
                  key: api_key(7, xValue.key)
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
