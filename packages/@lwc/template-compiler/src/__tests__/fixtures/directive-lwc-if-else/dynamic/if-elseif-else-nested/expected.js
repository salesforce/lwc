import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>outer if</h1>`;
const stc0 = {
  key: 2,
};
const stc1 = {
  key: 3,
};
const stc2 = {
  key: 4,
};
const stc3 = {
  key: 5,
};
const stc4 = {
  key: 6,
};
const stc5 = {
  key: 7,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    h: api_element,
    dc: api_dynamic_component,
    f: api_flatten,
  } = $api;
  return api_flatten([
    $cmp.outer.if
      ? [api_static_fragment($fragment1(), 1)]
      : $cmp.outer.elseif1
      ? [api_element("h1", stc0, [api_text("outer elseif")])]
      : $cmp.outer.elseif2
      ? api_flatten([
          $cmp.inner.if
            ? [api_element("h1", stc1, [api_text("inner if")])]
            : $cmp.inner.elseif
            ? [api_element("h1", stc2, [api_text("inner elseif")])]
            : $cmp.inner.elseif2
            ? api_flatten([
                api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc3),
              ])
            : [api_element("h1", stc4, [api_text("inner else")])],
        ])
      : [api_element("h1", stc5, [api_text("outer else")])],
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
