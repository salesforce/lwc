import { createElement } from 'engine';
import App from 'simple-list-container';

const element = createElement('simple-list-container', { is: App });
element.header = 'super awesome demo';
element.label = 're-shuffle';
element.min = 30;

document.body.appendChild(element);
