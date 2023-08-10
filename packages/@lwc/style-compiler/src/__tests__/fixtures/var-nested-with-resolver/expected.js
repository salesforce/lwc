function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {--slds-c-button-neutral-shadow-focus: var(\n --slds-c-buttonstateful-shadow-focus,\n var(--sds-g-color-brand-base-50, #0176d3) 0 0 3px\n );}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];