import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (itValue, itIndex, itFirst, itLast) {
    const it = {
      value: itValue,
      index: itIndex,
      first: itFirst,
      last: itLast,
    };
    return api_element(
      "span",
      {
        key: api_key(0, it.id),
      },
      [api_text(api_dynamic_text(it.value))]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
