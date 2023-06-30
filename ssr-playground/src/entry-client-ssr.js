import { hydrateComponent } from 'lwc';
import Parent from "x/parent";

const serverRenderedElement = document.querySelector('#main');
hydrateComponent(serverRenderedElement.children[0], Parent, window.APP_PROPS);
