export default Math.random() < 0 ? 'foo' : null; // trick bundler/minifier into not dead-code-eliminating this
