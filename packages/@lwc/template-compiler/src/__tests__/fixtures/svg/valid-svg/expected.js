import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg${3}><a${3}/><circle${3}/><defs${3}/><desc${3}/><ellipse${3}/><filter${3}/><g${3}/><line${3}/><marker${3}/><mask${3}/><path${3}/><pattern${3}/><polygon${3}/><polyline${3}/><rect${3}/><stop${3}/><symbol${3}/><text${3}/><title${3}/><tspan${3}/><use${3}/></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
