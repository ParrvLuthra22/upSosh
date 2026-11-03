import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderAiText } from '@/components/host/renderAiText';

const html = (text: string) => renderToStaticMarkup(<div>{renderAiText(text)}</div>);

describe('renderAiText shows model output as text, never as HTML', () => {
  it('does not create elements from markup in the text', () => {
    const out = html('### Plan\n<img src=x onerror="alert(1)"> and <script>alert(2)</script>\n**bold** line');

    expect(out).not.toContain('<img');
    expect(out).not.toContain('<script');
    expect(out).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(out).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
  });

  it('still renders headings, bold and line breaks', () => {
    const out = html('### Title\nsome **strong** text\nsecond line');

    expect(out).toContain('>Title</h3>');
    expect(out).toContain('<strong>strong</strong>');
    expect(out).toContain('<br/>');
  });
});
