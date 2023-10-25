import { logger } from "example/log";

class Adapter {
  uuid = Math.floor(Math.random() * 1_000_000_000);

  config;
  timeoutId = null;

  constructor(callback) {
    this.callback = callback;
  }

  update(config) {
    this.config = config;
    logger.log(
      `Updating adapter ${this.uuid} for component ${this.config?.uuid}`
    );
  }

  connect() {
    // Simulate an api request or some async action.
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.callback('VALUE!');
    }, 2_000);

    logger.log(
      `Connecting adapter ${this.uuid} for component ${this.config?.uuid}`
    );
  }

  disconnect() {
    // Cancel any subscriptions
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    logger.log(
      `Disconnecting adapter ${this.uuid} for component ${this.config?.uuid}`
    );
  }
}

export const getValue = Adapter;
