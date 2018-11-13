import { registerTemplate } from "lwc";
import stylesheet0 from "@shared/styles";
import stylesheet1 from "./local";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {} = $api;

  return [];
}

export default registerTemplate(tmpl);

function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ``;
}

const stylesheets = [stylesheet0, stylesheet1, stylesheet];
tmpl.stylesheets = stylesheets;
