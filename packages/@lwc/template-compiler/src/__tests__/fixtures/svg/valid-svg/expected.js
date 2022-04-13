import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg${1}${2}><a${1}${2}></a><circle${1}${2}><!-- &lt;clipPath&gt;&lt;/clipPath&gt; --><defs${1}${2}></defs><desc${1}${2}></desc><ellipse${1}${2}><filter${1}${2}></filter><g${1}${2}></g><line${1}${2}><marker${1}${2}></marker><mask${1}${2}></mask><path${1}${2}><pattern${1}${2}></pattern><polygon${1}${2}></polygon><polyline${1}${2}></polyline><rect${1}${2}><stop${1}${2}></stop><symbol${1}${2}></symbol><text${1}${2}></text><!-- &lt;textPath&gt;&lt;/textPath&gt; --><title${1}${2}></title><tspan${1}${2}></tspan><use${1}${2}></use></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
