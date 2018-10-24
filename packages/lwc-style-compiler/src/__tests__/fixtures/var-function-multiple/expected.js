export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "div" + shadowSelector + " { color: var(--lwc-color), var(--lwc-other); }\ndiv" + shadowSelector + " { border: var(--border, 1px solid rgba(0, 0, 0, 0.1)); }\ndiv" + shadowSelector + " { background: linear-gradient(to top, var(--lwc-color), var(--lwc-other)); }\n";
    return content;
}
