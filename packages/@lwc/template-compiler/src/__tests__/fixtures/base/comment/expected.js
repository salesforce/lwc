import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text } = $api;
  return [api_text("Hello world", 0)];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
