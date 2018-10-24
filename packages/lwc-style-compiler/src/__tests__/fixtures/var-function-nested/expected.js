export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "div" + shadowSelector + " { background: var(--lwc-color, var(--lwc-other, black)); }\n";
    return content;
}
