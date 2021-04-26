import { Graphviz, graphviz } from 'd3-graphviz';
import { createDotFromText } from './dot';

// HACK: follow types are defined at @types/d3-graphviz
interface GraphvizEnterElement {
  ownerDocument: Document;
  namespaceURI: string;
  appendChild(newChild: Node): Node;
  insertBefore(newChild: Node, refChild: Node): Node;
  querySelector(selectors: string): Element;
  querySelectorAll(selectors: string): NodeListOf<Element>;
}

type GraphvizBaseType = Element | GraphvizEnterElement | Document | Window | null;

export default {
  render(target: string | Graphviz<GraphvizBaseType, any, GraphvizBaseType, any>, text: String) {
    if (typeof target === 'string') {
      return graphviz(`#${target}`).renderDot(createDotFromText(text));
    } else {
      return target.renderDot(createDotFromText(text));
    }
  },
  convertToDot(text: String) {
    return createDotFromText(text);
  },
  getGraphvizInstance(targetId: string) {
    return graphviz(`#${targetId}`);
  },
};
