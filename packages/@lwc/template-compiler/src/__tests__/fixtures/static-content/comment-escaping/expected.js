import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}><!-- --&gt;&lt;script&gt;alert(&#x27;pwned&#x27;)&lt;/script&gt; &lt;!-- --></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
