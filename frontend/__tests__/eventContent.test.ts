import fs from 'fs';
import path from 'path';
import { descriptionParagraphs, normaliseIncluded, parseIncludedLines } from '@/lib/eventContent';

describe('descriptionParagraphs', () => {
  it('splits on blank lines and trims', () => {
    expect(descriptionParagraphs('One.\n\n  Two.  \r\n\r\nThree.')).toEqual(['One.', 'Two.', 'Three.']);
  });
  it('is empty for missing or blank descriptions', () => {
    expect(descriptionParagraphs(undefined)).toEqual([]);
    expect(descriptionParagraphs('   \n\n ')).toEqual([]);
  });
});

describe('normaliseIncluded', () => {
  it('passes arrays through, trimmed, dropping blanks and non-strings', () => {
    expect(normaliseIncluded([' Chai ', '', 3, 'Ticket'])).toEqual(['Chai', 'Ticket']);
  });
  it('accepts a JSON string and ignores junk', () => {
    expect(normaliseIncluded('["A","B"]')).toEqual(['A', 'B']);
    expect(normaliseIncluded('nope')).toEqual([]);
    expect(normaliseIncluded(undefined)).toEqual([]);
    expect(normaliseIncluded({})).toEqual([]);
  });
});

describe('parseIncludedLines', () => {
  it('one item per line, blanks dropped, capped at 12', () => {
    expect(parseIncludedLines('Chai\n\n  Ticket \r\n')).toEqual(['Chai', 'Ticket']);
    expect(parseIncludedLines(Array.from({ length: 20 }, (_, i) => `x${i}`).join('\n'))).toHaveLength(12);
    expect(parseIncludedLines('')).toEqual([]);
  });
});

describe('event page source', () => {
  const src = fs.readFileSync(path.join(__dirname, '../app/events/[slug]/EventPageClient.tsx'), 'utf8');
  it('no longer carries the generic placeholder copy', () => {
    expect(src).not.toMatch(/DEFAULT_EXTENDED|EXTENDED_OVERRIDES|getExtended/);
    expect(src).not.toContain('curated, intimate experience');
    expect(src).not.toContain('Personalised pace matching');
  });
  it('shows What\'s included only when the host provided items', () => {
    expect(src).toMatch(/\(event\.included\?\.length \?\? 0\) > 0 &&/);
  });
});
