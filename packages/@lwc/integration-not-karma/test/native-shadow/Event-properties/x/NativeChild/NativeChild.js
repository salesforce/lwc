export default function () {
    const child = document.createElement('x-native-child');
    const sr = child.attachShadow({ mode: 'open' });
    const h2 = document.createElement('h2');
    h2.innerHTML = 'Child running in native shadow(open) mode';
    sr.appendChild(h2);
    return child;
}
