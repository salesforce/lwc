import { createElement } from 'lwc';
import XBasic from 'x/basic';
const container = document.getElementById('main');
const element = createElement('x-basic', { is: XBasic });
container.appendChild(element);
