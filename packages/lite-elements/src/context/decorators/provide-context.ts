import { LiteContext } from '@/context/context-provider';
import type { UnknownContext } from '@/context/types';
import type { LiteElement } from '@/core/LiteElement';
import type { AttributeTypeConstant } from '@/types';

type CreateContextOptions<T extends UnknownContext> = {
  context: T;
  initialValue?: T['__context__'];
  hydrate?: AttributeTypeConstant;
};

/**
 * A decorator to provide a context to the target element.
 * @param contextToProvide
 * @returns
 */
export function provideContext<T extends UnknownContext>({ context, initialValue, hydrate }: CreateContextOptions<T>) {
  return (proto: LiteElement, propertyKey: string) => {
    const originalConnectedCallback = proto.connectedCallback;

    proto.connectedCallback = function (this: LiteElement) {
      originalConnectedCallback.call(this);
      (this as any)[propertyKey] = new LiteContext<T>(this, { context, initialValue, hydrate });
      this.connectedContextCallback(context);
    };
  };
}
