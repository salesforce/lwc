import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {} = $api;
  return [];
}

export default registerTemplate(tmpl);

function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return (
    "\n" +
    (nativeShadow ? ":host {color: red;}" : hostSelector + " {color: red;}") +
    "\ndiv" +
    shadowSelector +
    " {color: blue;}\n"
  );
}

const stylesheets = [stylesheet];
tmpl.stylesheets = stylesheets;
