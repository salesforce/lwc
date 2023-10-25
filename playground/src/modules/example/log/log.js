import { LightningElement } from "lwc";
import { logger } from './logger';

export { logger };

export default class Log extends LightningElement {
  static renderMode = "light";

  logs = [];

  connectedCallback() {
     logger.onEntry((logs) => this.logs = logs);
  }
}