export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "" + shadowSelector + "::after {}\nh1" + shadowSelector + "::before {}\n";
    return content;
}
