import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
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
              key: api_key(1, x.value.id),
            },
            [
              api_element("span", stc1, [
                api_text("Row: " + api_dynamic_text(x.index)),
              ]),
              api_text(". Value: " + api_dynamic_text(x.value)),
            ]
          ),
          $cmp.isTrue
            ? api_element(
                "div",
                {
                  key: api_key(3, x.value.key),
                },
                [api_text("Text")]
              )
            : null,
        ];
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
