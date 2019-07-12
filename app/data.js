import org from '../dummy/org';
import pages from '../dummy/pages';
import sections from '../dummy/sections';
import {request} from 'graphql-request';
import fetch from 'axios';
import {graphCoolToken} from '../settings/secrets';

export async function getGraphData(dataName, orgId) {
  let query;
  let variables;
  switch (dataName) {
    case 'allOrgs':
      query = /* GraphQL */ `
        query {
          allOrgs {
            id
          }
        }
      `;
      break;
    case 'org': 
      query = /* GraphQL */ `
        query getOrg($orgId: ID!){
          Org(id: $orgId){
            id
            name
            title
            theme
            defaultHeader{
              tagline
              color
              logo{
                url
              }
            }
            defaultFooter{
              email
              color
            }
          }
        }
      `;
      variables = {orgId};
      break;
    case 'pages': 
      query = `
        query getPages {
          allPages(filter: {org: {id: "cjxx2zcoq12bg0124patf4mw9"}}) {
            id
            title
            preamble
            sections {
              title
              id
              text
              image {
                id
                file {
                  url
                }
                caption
                description
              }
            }
            image {
              id
              file {
                url
              }
              caption
              description
            }
            conclusion
          }
        }
      `;
      variables = {pageId};
      break;
    case 'sections': 
      query = `
        query getSections {
          allSections{
            id
            title
            text
            image{
              file{
                url
              }
              caption
              description
            }
          }
        }
      `;
      variables = {sectionId};
      break;
    default:
      throw new Error(`Unknown data source: ${dataName}`);
  }
  const endpoint = `https://api.graph.cool/simple/v1/${graphCoolToken}`;
  try {
    const data = await request(endpoint, query, variables);
    return data;
  } catch(error) {
    console.error(error, endpoint);
  }
  
}

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
