// bootstrap process for the app
import { createElement } from 'engine';
import App from 'hello-world';

const container = document.getElementById('container');
const element = createElement('hello-world', { is: App });
element.friendlyName = 'Sir';
container.appendChild(element);
