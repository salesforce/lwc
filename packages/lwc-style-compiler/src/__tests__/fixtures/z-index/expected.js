export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "h1" + shadowSelector + "{z-index:100}h2" + shadowSelector + "{z-index:500}";
    return content;
}
