import org from '../dummy/org';
import pages from '../dummy/pages';
//import sections from '../dummy/sections';

export function getData(dataName) {
  switch (dataName) {
    case 'org':
      return org.data;
    case 'pages':
      return pages.data;
    case 'sections':
      return sections.data;
    default:
      throw new Error(`Unknown data source: ${dataName}`);
  }
}
