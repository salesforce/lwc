import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.isTrue ? api_text("Outer") : null,
    $cmp.isTrue
      ? api_fragment(
          0,
          api_iterator($cmp.items, function (item) {
            return api_element(
              "p",
              {
                key: item.id,
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
