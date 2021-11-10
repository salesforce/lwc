function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["[turkey='val']", shadowSelector, " {}[keyboard='val']", shadowSelector, " {}[notif\\:true='val']", shadowSelector, " {}[notfor\\:item='val']", shadowSelector, " {}[notfor\\:each='val']", shadowSelector, " {}[notiterator\\:name='val']", shadowSelector, " {}"].join('');
}
export default [stylesheet];