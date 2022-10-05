import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (item) {
    return item.visible
      ? api_fragment(
          0,
          [
            api_element(
              "div",
              {
                key: api_key(1, item.key),
              },
              [api_text("Conditional Iteration")]
            ),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_element(
              "div",
              {
                key: api_key(2, item.key),
              },
              [api_text("Else")]
            ),
          ],
          0
        );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
