export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "h1" + shadowSelector + " > a" + shadowSelector + " {}\nh1" + shadowSelector + " + a" + shadowSelector + " {}\ndiv.active" + shadowSelector + " > p" + shadowSelector + " {}\n";
    return content;
}
