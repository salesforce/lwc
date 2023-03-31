import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<menu${3}><menuitem label="my-menuitem"${3}></menu>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
