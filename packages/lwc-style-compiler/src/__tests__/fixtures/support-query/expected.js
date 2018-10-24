export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "@supports (display: flex) {\n    h1" + shadowSelector + " {}\n}\n";
    return content;
}
