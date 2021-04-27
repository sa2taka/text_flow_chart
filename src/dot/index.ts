import { parse } from './syntax_parser';
import { createDot } from './dot_generator';

export function createDotFromText(text: String) {
  const nodes = parse(text);
  return createDot(nodes);
}
