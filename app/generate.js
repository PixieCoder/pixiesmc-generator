import { template } from 'lodash';
import fs from 'fs';
import { getGraphData } from './data';
import { deleteFolderRecursive } from './utils';

function createDistFolder(name) {
  const distName = `./dist/${name}`;
  if (fs.existsSync(distName)) {
    deleteFolderRecursive(distName);
  }
  fs.mkdirSync(distName, { recursive: true });
}

function generateSections(theme, sections) {
  const retArray = [];
  const sectionTemplate = template(fs.readFileSync(`./templates/${theme}/section.tpl.html`, 'utf8'));
  const imageTemplate = template(fs.readFileSync(`./templates/${theme}/image.tpl.html`, 'utf8'));

  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];

    if (section.image) {
      section.imageHtml = imageTemplate(section.image);
    } else {
      section.imageHtml = '';
    }

    retArray.push({ html: sectionTemplate(section), id: section.id });
    //  Does the same thing with header and footer templates, but with sections.
    //  Puts all the information in an array and saves it in sectionOutput'i'.
  }
  return retArray;
}

function generatePages(pages, renderedComponents) {
  const { header, footer, sectionOutput } = renderedComponents;
  const retArray = [];
  const preambleTemplate = template(fs.readFileSync('./templates/default/preamble.tpl.html', 'utf8'));
  const conclusionTemplate = template(fs.readFileSync('./templates/default/conclusion.tpl.html', 'utf8'));
  const pageTemplate = template(fs.readFileSync('./templates/default/page.tpl.html', 'utf8'));
  const imageTemplate = template(fs.readFileSync('./templates/default/image.tpl.html', 'utf8'));

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];

    if (page.image) {
      page.imageHtml = imageTemplate(page.image);
    } else {
      page.imageHtml = '';
    }

    if (page.preamble) {
      page.preambleHtml = preambleTemplate(page);
    } else {
      page.preambleHtml = '';
    }

    if (page.conclusion) {
      page.conclusionHtml = conclusionTemplate(page);
    } else {
      page.conclusionHtml = '';
    }

    page.header = header;
    page.footer = footer;

    page.sectionsHtml = [];
    for (let j = 0; j < page.sections.length; j += 1) {
      const section = sectionOutput.find((element) => {
        if (element.id === page.sections[j].id) {
          return true;
        }
        return false;
      });
      page.sectionsHtml.push(section.html);
    }
    retArray.push({ link: page.link, output: pageTemplate(page) });
  }
  //  Writes out the html file and then saves it to a txt.
  return retArray;
}

function writePages(name, pageOutput) {
  for (let i = 0; i < pageOutput.length; i += 1) {
    fs.writeFileSync(`./dist/${name}/${pageOutput[i].link}.html`, pageOutput[i].output);
  }
}

async function processOrg(orgId) {
  const { Org: orgData } = await getGraphData('org', orgId);
  const pageData = await getGraphData('pages', orgId);
  const sectionData = await getGraphData('sections', orgId);
  const imageData = await getGraphData('images', orgId);

  const headerTemplate = template(fs.readFileSync('./templates/default/header.tpl.html', 'utf8'));
  const footerTemplate = template(fs.readFileSync('./templates/default/footer.tpl.html', 'utf8'));

  orgData.defaultHeader.html = headerTemplate({ logo: orgData.defaultHeader.logo.url });
  //  Puts the header from org through the headerTemplate and saves it in headerOuput.
  orgData.defaultFooter.html = footerTemplate({ contact: orgData.defaultFooter.email });
  //  Does the same thing with header, but with footer.
  createDistFolder(orgData.name);
  //  Makes a folder for the organization which we're going to save a file for.
  //  Is supposed to delete the file if it already exists.

  const sectionOutput = generateSections(orgData.theme, sectionData.allSections);

  const pageOutput = generatePages(pageData.allPages,
    {
      header: orgData.defaultHeader,
      footer: orgData.defaultFooter,
      sectionOutput,
    });

  writePages(orgData.name, pageOutput);

  //  console.log('Large orgdata: ', orgData);
  //  console.log('big pagedata: ', pageData);
  //  console.log('Wide sectiondata: ', sectionData);
  //  console.log('Broad imagedata: ', imageData);
}

export default async function generate() {
  const { allOrgs } = await getGraphData('allOrgs');

  for (let i = 0; i < allOrgs.length; i += 1) {
    const orgId = allOrgs[i].id;
    processOrg(orgId);
  }
}
