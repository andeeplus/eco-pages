import type { EcoComponent } from '@ecopages/core';
import type { LiteCounterProps } from './lite-counter.script';

export const LiteCounter: EcoComponent<LiteCounterProps> = ({ count }) => {
  return (
    <lite-counter count={count}>
      <button type="button" data-ref="decrement" aria-label="Decrement">
        -
      </button>
      <span data-ref="count">{count}</span>
      <button type="button" data-ref="increment" aria-label="Increment">
        +
      </button>
    </lite-counter>
  );
};

LiteCounter.config = {
  importMeta: import.meta,
  dependencies: {
    scripts: ['./lite-counter.script.ts'],
    stylesheets: ['./lite-counter.css'],
  },
};
