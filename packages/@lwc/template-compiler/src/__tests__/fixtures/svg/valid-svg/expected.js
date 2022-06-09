import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg${3}><a${3}></a><circle${3}><defs${3}></defs><desc${3}></desc><ellipse${3}><filter${3}></filter><g${3}></g><line${3}><marker${3}></marker><mask${3}></mask><path${3}><pattern${3}></pattern><polygon${3}></polygon><polyline${3}></polyline><rect${3}><stop${3}></stop><symbol${3}></symbol><text${3}></text><title${3}></title><tspan${3}></tspan><use${3}></use></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
