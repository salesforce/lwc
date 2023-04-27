import { registerStylesheet } from 'lwc';
import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "@keyframes slidein" + suffixToken + " {from {margin-left: 100%;}to {margin-left: 0%;}}div" + shadowSelector + " {color: " + (varResolver("--my-var")) + ";animation: 200ms slidein" + suffixToken + ";}span" + shadowSelector + " {animation: " + (varResolver("--another-var")) + " slidein" + suffixToken + ";}p" + shadowSelector + " {animation-name: slidein" + suffixToken + ";animation-delay: 1s;}input" + shadowSelector + " {animation-name: spin;}";
  /*LWC compiler vX.X.X*/
}
registerStylesheet && registerStylesheet(stylesheet);
export default [stylesheet];