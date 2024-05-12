import type { LiteElement } from '@eco-pages/lite-elements';
import {
  type Context,
  ContextRequestEvent,
  ContextSubscriptionRequestEvent,
  type ContextType,
  type UnknownContext,
} from './context-provider';

/**
 * A decorator to subscribe to a context selector.
 * @param context The context to subscribe to.
 * @param selector The selector to subscribe to. If not provided, the whole context will be subscribed to.
 * @param subscribe @default true Whether to subscribe or unsubscribe. Optional.
 * @returns
 */
export function contextSelector<T extends Context<unknown, unknown>>({
  context,
  select,
  subscribe = true,
}: {
  context: T;
  select?: keyof ContextType<T>;
  subscribe?: boolean;
}) {
  return (proto: LiteElement, _: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const originalConnectedCallback = proto.connectedCallback;

    proto.connectedCallback = function (this: LiteElement) {
      originalConnectedCallback.call(this);
      this.dispatchEvent(new ContextSubscriptionRequestEvent(context, originalMethod.bind(this), select, subscribe));
    };

    descriptor.value = function (
      ...args: {
        [K in keyof ContextType<T>]: ContextType<T>[K];
      }[]
    ) {
      const result = originalMethod.apply(this, args);
      return result;
    };

    return descriptor;
  };
}

/**
 * A decorator to provide a context to the target element.
 * @param contextToProvide
 * @returns
 */
export function consumeContext(contextToProvide: UnknownContext) {
  return (proto: LiteElement, propertyKey: string) => {
    const originalConnectedCallback = proto.connectedCallback;

    proto.connectedCallback = function (this: LiteElement) {
      originalConnectedCallback.call(this);
      this.dispatchEvent(
        new ContextRequestEvent(contextToProvide, (context) => {
          (this as any)[propertyKey] = context;
          console.log('Connected context:', { contextToProvide, context });
          this.connectedContextCallback(contextToProvide);
        }),
      );
    };
  };
}
