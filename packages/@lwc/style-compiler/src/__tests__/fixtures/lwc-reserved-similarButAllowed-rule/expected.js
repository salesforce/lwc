function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "[turkey='val']" + shadowSelector + " {}\n[keyboard='val']" + shadowSelector + " {}\n[notif\\:true='val']" + shadowSelector + " {}\n[notfor\\:item='val']" + shadowSelector + " {}\n[notfor\\:each='val']" + shadowSelector + " {}\n[notiterator\\:name='val']" + shadowSelector + " {}\n";
}
export default [stylesheet];