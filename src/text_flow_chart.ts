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
type ImplemtableGraphviz = Graphviz<GraphvizBaseType, unknown, GraphvizBaseType, unknown>;

export default {
  render(target: string | ImplemtableGraphviz, text: string, callback?: () => void): ImplemtableGraphviz {
    if (typeof target === 'string') {
      return graphviz(`#${target}`).renderDot(createDotFromText(text), callback);
    } else {
      return target.renderDot(createDotFromText(text), callback);
    }
  },
  convertToDot(text: string): string {
    return createDotFromText(text);
  },
  getGraphvizInstance(targetId: string): ImplemtableGraphviz {
    return graphviz(`#${targetId}`);
  },
};
