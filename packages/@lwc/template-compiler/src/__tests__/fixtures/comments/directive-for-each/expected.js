import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    co: api_comment,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    i: api_iterator,
  } = $api;
  return [
    api_element("ul", stc0, [
      api_fragment(
        1,
        api_iterator($cmp.colors, function (color) {
          return api_fragment($cmp.color, [
            api_comment(" color "),
            api_element(
              "li",
              {
                key: color,
              },
              [api_text(api_dynamic_text(color))]
            ),
          ]);
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
