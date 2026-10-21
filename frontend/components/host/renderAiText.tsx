import React from 'react';

/**
 * Shows the AI planner's reply as React elements, so any markup in it is
 * displayed as text and never parsed as HTML. Supports the three bits of
 * markdown the planner uses: "### heading" lines, **bold**, and line breaks.
 */
export function renderAiText(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    const heading = /^### (.*)$/.exec(line);
    if (heading) {
      return <h3 key={i} className="text-lg font-bold text-secondary mb-2">{renderBold(heading[1])}</h3>;
    }
    return (
      <React.Fragment key={i}>
        {renderBold(line)}
        <br />
      </React.Fragment>
    );
  });
}

function renderBold(line: string): React.ReactNode[] {
  return line.split(/\*\*(.*?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}
