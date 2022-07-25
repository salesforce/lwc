export default function () {
    const parent = document.createElement('x-native-parent');
    const sr = parent.attachShadow({ mode: 'open' });
    const h1 = document.createElement('h1');
    h1.innerHTML = 'Parent running in native shadow(open) mode';
    sr.appendChild(h1);
    const container = document.createElement('div');
    sr.appendChild(container);
    return parent;
}
