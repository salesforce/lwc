export default Math.random() < 0 ? 'foo' : undefined; // trick bundler/minifier into not dead-code-eliminating this
