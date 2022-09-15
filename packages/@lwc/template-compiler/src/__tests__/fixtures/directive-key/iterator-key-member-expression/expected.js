import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
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
        return api_element(
          "p",
          {
            key: api_key(1, $cmp.foo.index),
          },
          [api_text(api_dynamic_text(x.value))]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
