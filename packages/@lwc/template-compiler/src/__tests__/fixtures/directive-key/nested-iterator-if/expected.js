import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    i: api_iterator,
  } = $api;
  return [
    api_element("section", stc0, [
      api_fragment(
        2,
        api_iterator($cmp.items, function (xValue, xIndex, xFirst, xLast) {
          const x = {
            value: xValue,
            index: xIndex,
            first: xFirst,
            last: xLast,
          };
          return api_fragment(x.value.id, [
            api_element(
              "div",
              {
                attrs: {
                  "data-islast": x.last,
                  "data-isfirst": x.first,
                },
                key: x.value.id,
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
                    key: x.value.key,
                  },
                  [api_text("Text")]
                )
              : null,
          ]);
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
