import _aB from "a/b";
import { registerTemplate, renderer } from "lwc";
const stc0 = {
  classMap: {
    s2: true,
  },
  key: 0,
};
const stc1 = {
  lwc: {
    dom: "manual",
  },
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("a-b", _aB, stc0, [
      $cmp.isTrue
        ? api_element("div", {
            props: {
              innerHTML: $cmp.ifRawHtml,
            },
            context: stc1,
            key: 1,
            renderer: renderer,
          })
        : null,
      api_fragment(
        2,
        api_iterator($cmp.items, function (item) {
          return api_element("div", {
            props: {
              innerHTML: item.forRawHtml,
            },
            context: stc1,
            key: item.id,
            renderer: renderer,
          });
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
