import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {--slds-c-button-neutral-shadow-focus: " + (varResolver("--slds-c-buttonstateful-shadow-focus",varResolver("--sds-g-color-brand-base-50","#0176d3") + " black")) + ";}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];