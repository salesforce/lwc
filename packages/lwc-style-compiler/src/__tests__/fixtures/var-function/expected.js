export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "div" + shadowSelector + " { color: var(--lwc-color); }\ndiv" + shadowSelector + " { color: var(--lwc-color, black); }\ndiv" + shadowSelector + " { color: var(--lwc-color) important; }\n";
    return content;
}
