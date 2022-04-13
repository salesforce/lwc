import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a class="test${0}" data-foo="datafoo" aria-hidden="h" role="presentation" href="/foo" title="test" tabindex="-1"${2}></a>`;
const $fragment2 = parseFragment`<svg class="cubano${0}" focusable="true"${2}><use xlink:href="xx"${1}${2}></use></svg>`;
const $fragment3 = parseFragment`<table bgcolor="x"${1}${2}></table>`;
const stc0 = {
  r: true,
};
const stc1 = {
  "data-xx": "foo",
};
const stc2 = {
  "aria-hidden": "hidden",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    c: api_custom_element,
    st: api_static_fragment,
    h: api_element,
  } = $api;
  return [
    api_custom_element("ns-foo", _nsFoo, {
      props: {
        d: $cmp.p.foo,
        id: api_scoped_id("ns-foo"),
      },
      key: 0,
    }),
    api_static_fragment($fragment1(), 2),
    api_custom_element("ns-bar", _nsBar, {
      classMap: stc0,
      attrs: stc1,
      props: {
        ariaDescribedBy: api_scoped_id("ns-foo"),
        ariaHidden: "hidden",
        fooBar: "x",
        foo: "bar",
        role: "xx",
        tabIndex: "0",
        bgColor: "blue",
      },
      key: 3,
    }),
    api_static_fragment($fragment2(), 5),
    api_static_fragment($fragment3(), 7),
    api_element("div", {
      className: $cmp.foo,
      attrs: stc2,
      key: 8,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
