import _aB from "a/b";
import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    s2: true,
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("a-b", _aB, stc0, [
      $cmp.isTrue
        ? api_fragment(
            1,
            api_iterator($cmp.items, function (item) {
              return api_element(
                "p",
                {
                  key: item.id,
                },
                [api_text("X")]
              );
            })
          )
        : null,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
