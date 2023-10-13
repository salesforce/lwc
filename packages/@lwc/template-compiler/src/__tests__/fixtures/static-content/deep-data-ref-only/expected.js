import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}></div>`;
const $fragment2 = parseFragment`<div${3}></div>`;
const $fragment3 = parseFragment`<div${3}></div>`;
const $fragment4 = parseFragment`<div${3}></div>`;
const $fragment5 = parseFragment`<div${3}></div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
const stc2 = {
  key: 4,
};
const stc3 = {
  ref: "foo",
};
const stc4 = {
  ref: "baz",
};
const stc5 = {
  ref: "bar",
};
const stc6 = {
  ref: "quux",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("div", stc0, [
      api_static_fragment($fragment1(), 2),
      api_element("div", stc1, [
        api_element("div", stc2, [
          api_static_fragment($fragment2(), 6, stc3),
          api_static_fragment($fragment3(), 8, stc4),
        ]),
      ]),
      api_static_fragment($fragment4(), 10, stc5),
      api_static_fragment($fragment5(), 12, stc6),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
