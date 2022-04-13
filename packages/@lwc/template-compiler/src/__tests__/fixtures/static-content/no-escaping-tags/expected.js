import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<xmp${1}${2}>&lt;/xmp&gt;Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></xmp>`;
let $fragment2;
const $hoisted2 = parseFragment`<iframe${1}${2}>Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></iframe>`;
let $fragment3;
const $hoisted3 = parseFragment`<noembed${1}${2}>Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></noembed>`;
let $fragment4;
const $hoisted4 = parseFragment`<noframes${1}${2}><p${1}${2}>It seems your browser does not support frames or is configured to not allow them.</p></noframes>`;
let $fragment5;
const $hoisted5 = parseFragment`<noscript${1}${2}><!-- anchor linking to external file --> <a href="https://www.mozilla.com/">External Link</a></noscript>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1),
    api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3),
    api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 5),
    api_static_fragment($fragment4 || ($fragment4 = $hoisted4()), 7),
    api_static_fragment($fragment5 || ($fragment5 = $hoisted5()), 9),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
