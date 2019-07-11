import org from '../dummy/org';
import pages from '../dummy/pages';
import sections from '../dummy/sections';
import {request} from 'graphql-request';
import fetch from 'axios';
import graphCoolToken from '../settings/secrets';

export async function getGraphData(dataName) {
  const endpoint = `https://api.graph.cool/simple/v1/${graphCoolToken}`;
  const query = /* GraphQL */ `query {allOrgs {id title}}`;
  const fetchRequest = {
    method: 'post',
    headers: {'content-type':'application/json'},
    body: `{"query": "${query}"}`//JSON.stringify({query:query})
  };
  try {
    //const data = await request(endpoint, query);
    const data = await fetch(endpoint, fetchRequest);
    const dataJson = await data.json();
    console.log(dataJson.data);
  } catch(error) {
    console.error(error);
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
