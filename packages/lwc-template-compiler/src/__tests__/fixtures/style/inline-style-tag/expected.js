import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {} = $api;

  return [];
}

export default registerTemplate(tmpl);

function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `${
    nativeShadow ? ":host {color: red;}" : hostSelector + " {color: red;}"
  }
div${shadowSelector} {color: blue;}`;
}

const stylesheets = [stylesheet];
tmpl.stylesheets = stylesheets;
