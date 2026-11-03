require('@testing-library/jest-dom');

// jsdom does not provide TextEncoder/TextDecoder, which react-dom/server needs
// when a test renders to a string.
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
