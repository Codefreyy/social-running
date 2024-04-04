// Polyfill for TextEncoder
global.TextEncoder = class {
    encode(str) {
      const buf = Buffer.from(str, 'utf-8');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
  };
  
  // Polyfill for TextDecoder
  global.TextDecoder = class {
    decode(bytes) {
      const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      return buf.toString('utf-8');
    }
  };
  
const { JSDOM } = require('jsdom');
const { showComments } = require('../public/client');
const { TextEncoder, TextDecoder } = require('text-encoding');

// Provide TextEncoder and TextDecoder to the global object
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = require('jest-fetch-mock');

describe('showComments', () => {
    let commentsSec;

    beforeEach(() => {
        // Create a virtual document object
        const { document } = new JSDOM('<html></html>').window;
        global.document = document;

        commentsSec = document.createElement("div");
        commentsSec.id = "commentsSec";
        document.body.appendChild(commentsSec);
    });

    test('should fetch comments and display them correctly', async () => {
        // Simulated review data
        const comments = [
            { username: 'user1', content: 'comment1', createdAt: '2024-04-02T12:00:00Z' },
            { username: 'user2', content: 'comment2', createdAt: '2024-04-02T12:10:00Z' }
        ];

        fetch.mockResponseOnce(JSON.stringify(comments));
        await showComments();

        // Verify that comments are displayed correctly
        const commentContainers = document.getElementsByClassName("commentsSec");
        expect(commentContainers[0].textContent).toContain('user1: comment1');
        expect(commentContainers[1].textContent).toContain('user2: comment2');
    });
});
