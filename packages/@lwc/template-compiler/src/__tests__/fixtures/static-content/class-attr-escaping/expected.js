import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1 class="&quot;>\\x3Cscript>alert('pwned')\\x3C/script>\\x3Ch1 foo=&quot;${0}"${2}></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
