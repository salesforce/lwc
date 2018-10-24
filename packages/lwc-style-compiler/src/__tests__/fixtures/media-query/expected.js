export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "@media screen and (min-width: 900px) {\n    h1" + shadowSelector + " {}\n}\n";
    return content;
}
