import d3, { Graphviz } from 'd3-graphviz';
import { createDotFromText } from './dot';

export default {
  render(target: string | Graphviz<any, any, any, any>, text: String) {
    if (typeof target === 'string') {
      return d3.graphviz(`#${target}`).renderDot(createDotFromText(text));
    } else {
      return target.renderDot(createDotFromText(text));
    }
  },
  converToDot(text: String) {
    return createDotFromText(text);
  },
};
