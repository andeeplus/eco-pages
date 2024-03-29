import type { LiteElement } from "@/lib/lite/LiteElement";
import type { LiteContext } from "@/lib/lite/context/lite-context";
import { type UnknownContext } from "@/lib/lite/context/types";
import { ContextProviderRequestEvent } from "@/lib/lite/context/events/context-provider-request";

/**
 * A decorator to provide a context to the target element.
 * @param contextToProvide
 * @returns
 */
export function contextProvider<T extends UnknownContext>(contextToProvide: T) {
  return function (proto: LiteElement, propertyKey: string) {
    const originalConnectedCallback = proto.connectedCallback;

    proto.connectedCallback = function (this: LiteElement) {
      originalConnectedCallback.call(this);
      this.dispatchEvent(
        new ContextProviderRequestEvent(contextToProvide, (context: LiteContext<T>) => {
          (this as any)[propertyKey] = context;
          this.connectedContextCallback(contextToProvide.name);
        })
      );
    };
  };
}
