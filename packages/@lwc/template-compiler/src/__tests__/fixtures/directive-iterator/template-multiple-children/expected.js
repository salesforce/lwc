import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    i: api_iterator,
  } = $api;
  return [
    api_fragment(
      0,
      api_iterator($cmp.items, function (xValue, xIndex, xFirst, xLast) {
        const x = {
          value: xValue,
          index: xIndex,
          first: xFirst,
          last: xLast,
        };
        return api_fragment($cmp.x.value.id, [
          api_element(
            "div",
            {
              key: $cmp.x.value.id,
            },
            [api_text(api_dynamic_text(x.value))]
          ),
          api_element(
            "div",
            {
              key: x.value.id,
            },
            [api_text(api_dynamic_text(x.value))]
          ),
        ]);
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
