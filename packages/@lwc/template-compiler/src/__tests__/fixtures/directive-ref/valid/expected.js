import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Foo</div>`;
const stc0 = {
  ref: "foo",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1, [api_static_part(0, stc0)])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
