import d3 from 'd3-graphviz';
import { createDotFromText } from './dot';

export default function (id: string, text: String) {
  d3.graphviz(`#${id}`).renderDot(createDotFromText(text));
}
