// Set the engine in test mode. This script need to be evaluated before the engine.
window.process = {
    env: {
        NODE_ENV: 'test'
    }
};
