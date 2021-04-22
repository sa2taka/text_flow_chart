import { Graphviz, graphviz } from 'd3-graphviz';
import { createDotFromText } from './dot';

export default {
  render(target: string | Graphviz<any, any, any, any>, text: String) {
    if (typeof target === 'string') {
      return graphviz(`#${target}`).renderDot(createDotFromText(text));
    } else {
      return target.renderDot(createDotFromText(text));
    }
  },
  converToDot(text: String) {
    return createDotFromText(text);
  },
  getGraphvizInstance(targetId: string) {
    return graphviz(`#${targetId}`);
  },
};
