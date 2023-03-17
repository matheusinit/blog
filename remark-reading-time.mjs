import { readingTime as getReadingTime } from 'reading-time-estimator';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime () {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage, 200, 'pt-br')
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
