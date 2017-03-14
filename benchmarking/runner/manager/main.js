import * as Raptor from 'raptor-engine';
import Shell from 'manager:shell';

const SLDS_CDN = 'https://unpkg.com/@salesforce-ux/design-system@2.2.1/assets/styles/salesforce-lightning-design-system.css';

function asyncCSS(url) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;

    document.querySelector('head').appendChild(link);
}

window.onload = () => {
    // Load SLDS async, usefull when the CDN is not accessible
    asyncCSS(SLDS_CDN);

    const shell = Raptor.createElement(Shell.tagName, { is: Shell });
    const container = document.querySelector('#shell');
    container.appendChild(shell);
};
