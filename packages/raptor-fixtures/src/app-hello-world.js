import { createElement } from 'engine';
import App from 'hello-world';

const element = createElement('hello-world', { is: App });
element.friendlyName = 'Sir';

document.body.appendChild(element);
