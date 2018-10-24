export default function(hostSelector, shadowSelector) {
    let content = "";
    content += ":host(.foo) {}\n" + hostSelector + ".foo {}\n:host(.foo) span" + shadowSelector + " {}\n" + hostSelector + ".foo span" + shadowSelector + " {}\n:host(:hover) {}\n" + hostSelector + ":hover {}\n:host(.foo, .bar) {}\n" + hostSelector + ".foo," + hostSelector + ".bar {}\n";
    return content;
}
