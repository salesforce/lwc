import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<xmp${3}>&lt;/xmp&gt;Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></xmp>`;
const $fragment2 = parseFragment`<iframe${3}>Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></iframe>`;
const $fragment3 = parseFragment`<noembed${3}>Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></noembed>`;
const $fragment4 = parseFragment`<noframes${3}><p${3}>It seems your browser does not support frames or is configured to not allow them.</p></noframes>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_static_fragment($fragment3(), 5),
    api_static_fragment($fragment4(), 7),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
