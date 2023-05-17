import { registerTemplate } from "lwc";
const stc0 = ["Conditional Iteration"];
const stc1 = ["Else"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
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
              stc0,
              128
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
              stc1,
              128
            ),
          ],
          0
        );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
