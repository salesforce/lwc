import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section class="foo bar   baz-fiz${0}"${2}></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
