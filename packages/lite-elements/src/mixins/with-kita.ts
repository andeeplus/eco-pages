import type { LiteElement } from '@/core/LiteElement';
import type { RenderInsertPosition } from '@/types';

type Constructor<T> = new (...args: any[]) => T;

interface WithKitaMixin {
  renderTemplate: (props: {
    target: HTMLElement;
    template: JSX.Element | string;
    insert?: RenderInsertPosition;
  }) => Promise<void>;
}
export function WithKita<T extends Constructor<LiteElement>>(Base: T): T & Constructor<WithKitaMixin> {
  return class extends Base implements WithKitaMixin {
    override async renderTemplate({
      target = this,
      template,
      insert = 'replace',
    }: {
      target: HTMLElement;
      template: JSX.Element | string;
      insert?: RenderInsertPosition;
    }) {
      const safeTemplate = typeof template !== 'string' ? template.toString() : template;
      switch (insert) {
        case 'replace':
          target.innerHTML = safeTemplate;
          break;
        case 'beforeend':
          target.insertAdjacentHTML('beforeend', safeTemplate);
          break;
        case 'afterbegin':
          target.insertAdjacentHTML('afterbegin', safeTemplate);
          break;
      }
    }
  } as T & Constructor<WithKitaMixin>;
}
