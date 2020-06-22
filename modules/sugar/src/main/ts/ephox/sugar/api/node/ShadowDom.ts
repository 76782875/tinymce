import {
  Document,
  Element as DomElement,
  Event,
  EventTarget,
  HTMLElement,
  HTMLElementTagNameMap,
  Node as DomNode,
  ShadowRoot
} from '@ephox/dom-globals';
import * as Node from './Node';
import * as Head from './Head';
import { Fun, Option, Type } from '@ephox/katamari';
import Element from './Element';
import * as Traverse from '../search/Traverse';
import { EventArgs } from '../events/Types';

export type RootNode = Element<Document | ShadowRoot>;

/**
 * Is the element a ShadowRoot?
 *
 * Note: this is insufficient to test if any element is a shadow root, but it is sufficient to differentiate between
 * a Document and a ShadowRoot.
 */
export const isShadowRoot = (dos: RootNode): dos is Element<ShadowRoot> =>
  Node.isDocumentFragment(dos);

const supported: boolean =
  Type.isFunction((DomElement.prototype as any).attachShadow) &&
  Type.isFunction((DomNode.prototype as any).getRootNode);

/**
 * Does the browser support shadow DOM?
 *
 * NOTE: Node.getRootNode() and Element.attachShadow don't exist on IE11 and pre-Chromium Edge.
 */
export const isSupported = Fun.constant(supported);

export const getRootNode: (e: Element<DomNode>) => RootNode =
  supported
    ? (e) => Element.fromDom((e.dom() as any).getRootNode())
    : Traverse.documentOrOwner;

/** Create an element, using the actual document. */
export const createElement: {
  <K extends keyof HTMLElementTagNameMap>(dos: RootNode, tag: K): Element<HTMLElementTagNameMap[K]>;
  (dos: RootNode, tag: string): Element<HTMLElement>;
} = (dos: RootNode, tag: string) =>
  Element.fromTag(tag, Traverse.documentOrOwner(dos).dom());

/** Where style tags need to go. ShadowRoot or document head */
export const getStyleContainer = (dos: RootNode): Element<DomNode> =>
  isShadowRoot(dos) ? dos : Head.getHead(Traverse.documentOrOwner(dos));

/** Where content needs to go. ShadowRoot or document body */
export const getContentContainer = (dos: RootNode): Element<DomNode> =>
  // Can't use Body.body without causing a circular module reference (since Body.inBody uses ShadowDom)
  isShadowRoot(dos) ? dos : Element.fromDom(Traverse.documentOrOwner(dos).dom().body);

/** Is this element either a ShadowRoot or a descendent of a ShadowRoot. */
export const isInShadowRoot = (e: Element<DomNode>): boolean =>
  getShadowRoot(e).isSome();

/** If this element is in a ShadowRoot, return it. */
export const getShadowRoot = (e: Element<DomNode>): Option<Element<ShadowRoot>> => {
  const r = getRootNode(e);
  return isShadowRoot(r) ? Option.some(r) : Option.none();
};

/** Return the host of a ShadowRoot.
 *
 * This function will throw if Shadow DOM is unsupported in the browser, or if the host is null.
 * If you actually have a ShadowRoot, this shouldn't happen.
 */
export const getShadowHost = (e: Element<ShadowRoot>): Element<DomElement> =>
  Element.fromDom(e.dom().host);

/**
 * Gets the event target based on shadow dom properties. Only works if the shadow tree is open.
 * See: https://developers.google.com/web/fundamentals/web-components/shadowdom#events
 */
export const getOriginalEventTarget = (event: Event): Option<EventTarget> => {
  if (isSupported()) {
    // When target element is inside Shadow DOM we need to take first element from composedPath
    // otherwise we'll get Shadow Root parent, not actual target element.
    // TODO: update @ephox/dom-globals to include Event.composedPath
    const eventAny = event as any;
    if (eventAny.composedPath) {
      const composedPath = eventAny.composedPath();
      if (composedPath && composedPath.length > 0) {
        return Option.from(composedPath[0]);
      }
    }
  }
  return Option.from(event.target);
};

export const setEventTargetToOriginalTarget = <T extends Event> (event: EventArgs<T>): EventArgs<T> => {

  const doOverride = (target: EventTarget) => ({
    ...event,
    target: Fun.constant(Element.fromDom(target as DomNode))
  });

  return getOriginalEventTarget(event.raw()).fold(
    () => event,
    (target) => target === event.raw().target ? event : doOverride(target)
  );
};

export const isOpen = (sr: Element<ShadowRoot>): boolean =>
  (sr.dom() as any).mode === 'open';

export const isClosed = (sr: Element<ShadowRoot>): boolean =>
  (sr.dom() as any).mode === 'closed';

