// bootstrap process for the app
import { createElement } from 'engine';
import App from 'simple-list';

const container = document.getElementById('container');
const element = createElement('simple-list', { is: App });
element.header = 'super awesome demo';
element.label = 're-shuffle';
element.min = 30;
container.appendChild(element);
