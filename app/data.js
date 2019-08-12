import { request } from 'graphql-request';
import { graphCoolToken } from '../settings/secrets';

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
        defaultLang{
          title
          link
          id
        }
        defaultHeaders{
          tagline
          color
          logoDescription
          logo{
            name
            url
          }
          lang{
            id
          }
        }
        defaultFooters{
          address
          town
          email
          phone
          color
          footerText
          copyright
          lang{
            id
          }
        }
      }
    }
  `,
  pages: `
    query getPages($orgId: ID!) {
      allPages(filter: {org: {id: $orgId}}) {
        link
        lang{
          title
          link
          id
        }
        menuStatus
        id
        org{
          id
          title
        }
        title
        header{
          tagline
          color
          logoDescription
          logo{
            url
            name
          }
          lang{
            id
          }
        }
        footer{
          address
          town
          email
          phone
          color
          lang{
            id
          }
        }
        preamble
        sections {
          title
          id
        }
        image {
          id
          org{
            id
          }
          file {
            name
            url
          }
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
          id
        }
      }
    }
  `,
  images: `
    query getImages($orgId: ID!) {
      allImages (filter: {org: {id: $orgId}}) {
        file{
          name
          url
        }
        id
        caption
        description
        lang{
          id
        }
      }
    }
  `,
};

export async function getData(dataName, orgId) {
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

export default { getData };
