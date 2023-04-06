import { registerStylesheet } from 'lwc';
import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {color: " + (varResolver("--lwc-color")) + ";}div" + shadowSelector + " {color: " + (varResolver("--lwc-color","black")) + ";}div" + shadowSelector + " {color: " + (varResolver("--lwc-color")) + " important;}";
  /*LWC compiler vX.X.X*/
}
registerStylesheet(stylesheet);
export default [stylesheet];