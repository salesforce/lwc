export default Math.random() < 0 ? 'foo' : 0; // trick bundler/minifier into not dead-code-eliminating this
