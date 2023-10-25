import { logger } from 'example/log';

class Adapter {
  uuid = Math.floor(Math.random() * 1_000_000_000);

  config;

  mq = window.matchMedia('only screen and (max-width: 47.9375em)');

  constructor(callback) {
    this.callback = callback;
  }

  update(config) {
    this.config = config;
  }

  connect() {
    this.mq.addEventListener('change', () => {
      const isMobile = this.mq.matches;

      logger.log(`isMobile: ${isMobile}`);

      this.callback(isMobile);
    });
  }

  disconnect() {}
}

export const isMobile = Adapter;
