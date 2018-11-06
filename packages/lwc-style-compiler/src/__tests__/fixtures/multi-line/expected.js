function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `

${nativeShadow ? (":host(.selected) button" + shadowSelector + " {color: #0070d2;/* $slider-handle-color-background-active */}") : (hostSelector + ".selected button" + shadowSelector + " {color: #0070d2;/* $slider-handle-color-background-active */}")}

${nativeShadow ? (":host:not(.selected) button" + shadowSelector + " {color: #6d6d70;/*$color-background-info*/transition: all .2s ease-in-out;}") : (hostSelector + ":not(.selected) button" + shadowSelector + " {color: #6d6d70;/*$color-background-info*/transition: all .2s ease-in-out;}")}

${nativeShadow ? (":host:not(.selected):hover button" + shadowSelector + ",:host button:focus" + shadowSelector + " {color: #005fb2;/* $color-background-button-brand-hover */transform: scale(1.2);}") : (hostSelector + ":not(.selected):hover button" + shadowSelector + "," + hostSelector + " button:focus" + shadowSelector + " {color: #005fb2;/* $color-background-button-brand-hover */transform: scale(1.2);}")}
button:focus${shadowSelector} {outline: none;box-shadow: none;background-color: #f3f2f2;/* $color-border-context-bar-theme-default-active */}
`;
}
export default [stylesheet];