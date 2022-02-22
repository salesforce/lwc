function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@charset \"utf-8\";@namespace url(http://www.w3.org/1999/xhtml);@keyframes slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', " {from {margin-left: 100%;}to {margin-left: 0%;}}@media screen and (min-width: 900px) {article", shadowSelector, " {padding: 1rem 3rem;}}@supports (display: grid) {div", shadowSelector, " {display: grid;}}@document url('https://www.example.com/') {h1", shadowSelector, " {color: green;}}@font-face {font-family: 'Open Sans';src: url('/fonts/OpenSans-Regular-webfont.woff2') format('woff2'),\n url('/fonts/OpenSans-Regular-webfont.woff') format('woff');}@viewport {width: device-width;}@counter-style thumbs {system: cyclic;symbols: '\\1F44D';suffix: ' ';}@font-feature-values Font One {@styleset {nice-style: 12;}}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];