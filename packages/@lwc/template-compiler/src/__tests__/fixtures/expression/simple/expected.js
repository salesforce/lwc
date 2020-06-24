import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic } = $api;
  return [api_dynamic($cmp.text, 0)];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
