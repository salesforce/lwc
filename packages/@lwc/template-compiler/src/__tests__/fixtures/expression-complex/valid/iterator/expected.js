import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><a${3}>one</a></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    b: api_bind,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
  } = $api;
  const { _m0 } = $ctx;
  return api_iterator($cmp.bento, function (okazu) {
    return api_static_fragment($fragment1, api_key(1, okazu), [
      api_static_part(
        1,
        {
          on: {
            click: _m0 || ($ctx._m0 = api_bind(() => $cmp.taberu(okazu))),
          },
        },
        null
      ),
    ]);
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
