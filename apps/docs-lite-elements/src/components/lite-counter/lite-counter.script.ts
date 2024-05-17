import { LiteElement } from '@eco-pages/lite-elements/LiteElement';
import { customElement } from '@eco-pages/lite-elements/decorators/customElement';
import { onEvent } from '@eco-pages/lite-elements/decorators/onEvent';
import { querySelector } from '@eco-pages/lite-elements/decorators/querySelector';
import { reactiveProp } from '@eco-pages/lite-elements/decorators/reactiveProp';

export type LiteCounterProps = {
  value?: number;
};

@customElement('lite-counter')
export class LiteCounter extends LiteElement {
  @reactiveProp({ type: Number }) declare value: number;
  @querySelector('[data-text]') countText!: HTMLElement;

  @onEvent({ target: '[data-decrement]', type: 'click' })
  decrement() {
    if (this.value > 0) this.value--;
  }

  @onEvent({ target: '[data-increment]', type: 'click' })
  increment() {
    this.value++;
  }

  @onUpdated('value')
  updateCount() {
    this.dispatchEvent(new Event('change'));
    this.countText.textContent = this.value.toString();
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lite-counter': HtmlTag & LiteCounterProps;
    }
  }
}
