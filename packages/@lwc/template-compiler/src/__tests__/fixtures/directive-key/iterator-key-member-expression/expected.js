import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function forof1_0(xValue, xIndex, xFirst, xLast) {
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
      [api_dynamic(x.value)]
    );
  }
  const { k: api_key, d: api_dynamic, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      api_iterator($cmp.items, forof1_0)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
