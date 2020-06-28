import { ChildNode, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as Awareness from './Awareness';
import * as CursorPosition from './CursorPosition';

// not sure where the "correct" interface is declared, doesn't seem to be in Sugar
interface SelectionStart {
  readonly startContainer: () => Element<DomNode>;
  readonly startOffset: () => number;
}

type DescentFn = (element: Element<DomNode>) => Option<Element<DomNode & ChildNode>>;
type AwarenessFn = (element: Element<DomNode>, offset: number) => boolean;

const isAtEdge = (parent: Element<DomNode>, current: Element<DomNode>, currentOffset: number, descent: DescentFn, awareness: AwarenessFn): boolean =>
  descent(parent).fold(
    () => true,
    (element) => Compare.eq(current, element) && awareness(current, currentOffset)
  );

const isLeft = (parent: Element<DomNode>, selection: SelectionStart): boolean =>
  isAtEdge(parent, selection.startContainer(), selection.startOffset(), CursorPosition.first, Awareness.isStart);

// This is doing exactly the same thing as the above isLeft method, checking to see if an element/offset selection endpoint is at the left edge of its parent
// after ascending up to that parent except we explicitly provide the element and its offset instead of just using the selection object.
const isAtLeftEdge = (parent: Element<DomNode>, element: Element<DomNode>, offset: number): boolean =>
  isAtEdge(parent, element, offset, CursorPosition.first, Awareness.isStart);

const isRight = (parent: Element<DomNode>, selection: SelectionStart): boolean =>
  isAtEdge(parent, selection.startContainer(), selection.startOffset(), CursorPosition.last, Awareness.isEnd);

// This is doing exactly the same thing as the above isRight method, checking to see if an element/offset selection endpoint is at the right edge of its parent
// after ascending up to that parent except we explicitly provide the element and its offset instead of just using the selection object.
const isAtRightEdge = (parent: Element<DomNode>, element: Element<DomNode>, offset: number): boolean =>
  isAtEdge(parent, element, offset, CursorPosition.last, Awareness.isEnd);

export {
  isLeft,
  isAtLeftEdge,
  isRight,
  isAtRightEdge
};
