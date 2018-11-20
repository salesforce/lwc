import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {} = $api;

  return [];
}

export default registerTemplate(tmpl);

function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return (
    "\n" +
    (nativeShadow
      ? ":host {color: var(--color);}"
      : hostSelector + " {color: var(--color);}") +
    "\n"
  );
}

const stylesheets = [stylesheet];
tmpl.stylesheets = stylesheets;
