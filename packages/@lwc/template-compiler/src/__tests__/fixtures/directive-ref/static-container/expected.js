import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}></span>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  ref: "foo",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("div", stc0, [api_static_fragment($fragment1(), 2, stc1)]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
