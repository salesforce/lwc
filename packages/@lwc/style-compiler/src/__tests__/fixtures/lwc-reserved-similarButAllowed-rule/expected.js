function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " [turkey='val']", shadowSelector, " {}", macroSelector, " [keyboard='val']", shadowSelector, " {}", macroSelector, " [notif\\:true='val']", shadowSelector, " {}", macroSelector, " [notfor\\:item='val']", shadowSelector, " {}", macroSelector, " [notfor\\:each='val']", shadowSelector, " {}", macroSelector, " [notiterator\\:name='val']", shadowSelector, " {}"].join('');
}
export default [stylesheet];