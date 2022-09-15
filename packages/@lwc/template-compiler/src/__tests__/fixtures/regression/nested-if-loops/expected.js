import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.isTrue ? api_text("Outer") : null,
    $cmp.isTrue
      ? api_fragment(
          "it-fr1",
          api_iterator($cmp.items, function (item) {
            return api_element(
              "p",
              {
                key: api_key(0, item.id),
              },
              [api_text("Inner")]
            );
          })
        )
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
