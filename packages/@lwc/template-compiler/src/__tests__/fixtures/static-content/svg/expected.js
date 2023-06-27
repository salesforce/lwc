import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg xmlns="http://www.w3.org/2000/svg"${3}><path${3}/><path${3}/></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
