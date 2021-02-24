function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["[turkey='val']", shadowSelector, " {}[keyboard='val']", shadowSelector, " {}[notif\\:true='val']", shadowSelector, " {}[notfor\\:item='val']", shadowSelector, " {}[notfor\\:each='val']", shadowSelector, " {}[notiterator\\:name='val']", shadowSelector, " {}"].join('');
}
export default [stylesheet];