import { registerStylesheet } from 'lwc';
import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "color: " + (varResolver("--lwc-color")) + ";padding: 10px;}" + ((useActualHostSelector ? ":host(.foo) {" : hostSelector + ".foo {")) + "background: linear-gradient(to top," + (varResolver("--lwc-color")) + "," + (varResolver("--lwc-other")) + ");}div" + shadowSelector + " {background: " + (varResolver("--lwc-color",varResolver("--lwc-other","black"))) + ";display: \"block\";}";
  /*LWC compiler vX.X.X*/
}
registerStylesheet(stylesheet);
export default [stylesheet];