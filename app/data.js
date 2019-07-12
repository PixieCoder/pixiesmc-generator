import { request } from 'graphql-request';
import { graphCoolToken } from '../settings/secrets';
import org from '../dummy/org';
import pages from '../dummy/pages';
import sections from '../dummy/sections';

const queries = {
  allOrgs: `
    query {
      allOrgs {
        id
      }
    }
  `,
  org: `
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
  `,
  pages: `
    query getPages($orgId: ID!) {
      allPages(filter: {org: {id: $orgId}}) {
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
  `,
  sections: `
    query getSections($orgId: ID!) {
      allSections (filter: {org: {id: $orgId}}) {
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
  `,
  images: `
    query getImages($orgId: ID!) {
      allImages (filter: {org: {id: $orgId}}) {
        file{
          url
        }
        id
        caption
        description
      }
    }
  `,
};

export async function getGraphData(dataName, orgId) {
  const query = queries[dataName];
  if (!query) {
    throw new Error(`Unknown data source: ${dataName}`);
  }
  const variables = { orgId };
  const endpoint = `https://api.graph.cool/simple/v1/${graphCoolToken}`;

  try {
    const data = await request(endpoint, query, variables);
    return data;
  } catch (error) {
    console.error(error, endpoint);
    return null;
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
