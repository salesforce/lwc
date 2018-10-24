export default function(hostSelector, shadowSelector) {
    let content = "";
    content += ":not(p)" + shadowSelector + " {}\np:not(.foo, .bar)" + shadowSelector + " {}\n:matches(ol, li, span)" + shadowSelector + " {}\n";
    return content;
}
