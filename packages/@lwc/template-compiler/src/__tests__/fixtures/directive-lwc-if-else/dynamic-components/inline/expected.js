import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const $fragment2 = parseFragment`<h1${3}>elseif condition</h1>`;
const $fragment3 = parseFragment`<h1${3}>else condition</h1>`;
const stc0 = {
  key: 1,
};
const stc1 = {
  key: 4,
};
const stc2 = {
  key: 7,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    dc: api_dynamic_component,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.visible.if
      ? api_fragment(
          0,
          [
            api_dynamic_component($cmp.ctor1, stc0, [
              api_static_fragment($fragment1(), 3),
            ]),
          ],
          0
        )
      : $cmp.visible.elseif
      ? api_fragment(
          0,
          [
            api_dynamic_component($cmp.ctor2, stc1, [
              api_static_fragment($fragment2(), 6),
            ]),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_dynamic_component($cmp.ctor3, stc2, [
              api_static_fragment($fragment3(), 9),
            ]),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
