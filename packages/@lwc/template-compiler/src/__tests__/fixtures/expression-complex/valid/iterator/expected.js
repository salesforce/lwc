import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a${3}>one</a>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    b: api_bind,
    sp: api_static_part,
    st: api_static_fragment,
    h: api_element,
    i: api_iterator,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return api_iterator($cmp.bento, function (okazu) {
    return api_element(
      "div",
      {
        key: api_key(0, okazu),
      },
      [
        api_static_fragment($fragment1(), 2, [
          api_static_part(0, {
            on: {
              click: _m1 || ($ctx._m1 = api_bind(() => $cmp.taberu(okazu))),
            },
          }),
        ]),
      ]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
