import * as Raptor from 'raptor';
import Shell from 'manager:shell';

window.onload = () => {
    const shell = Raptor.createElement(Shell.tagName, { is: Shell });
    const container = document.querySelector('#shell');
    container.appendChild(shell);
};
