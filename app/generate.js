import { template } from 'lodash';
import { getData } from './data';
import fs from 'fs';
import { deleteFolderRecursive } from "./utils";

function createDistFolder(name) {
  const distName = './dist/' + name;
  if (fs.existsSync(distName)) {
    deleteFolderRecursive(distName);
  }
  fs.mkdirSync(distName, {recursive: true});
}

function generateSections(theme, sections) {
  let retArray = [];
  const sectionTemplate = template(fs.readFileSync('./templates/' + theme + '/section.tpl.html', 'utf8'));
  const imageTemplate = template(fs.readFileSync('./templates/' + theme + '/image.tpl.html', 'utf8'));
  
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];

    if (section.image) {
      section.imageHtml = imageTemplate(section.image);
    } else {
      section.imageHtml = "";
    }
    retArray.push(sectionTemplate(section));
    //Does the same thing with header and footer templates, but with sections.
    //Puts all the information in an array and saves it in sectionOutput'i'.
  }
  return retArray;
}

function generatePages(pages, header, footer, sectionOutput) {
  let retArray = [];
  const preambleTemplate = template(fs.readFileSync('./templates/default/preamble.tpl.html', 'utf8'));
  const conclusionTemplate = template(fs.readFileSync('./templates/default/conclusion.tpl.html', 'utf8'));
  const pageTemplate = template(fs.readFileSync('./templates/default/page.tpl.html', 'utf8'));
  const imageTemplate = template(fs.readFileSync('./templates/default/image.tpl.html', 'utf8'));
  
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];

    if (page.image) {
      page.imageHtml = imageTemplate(page.image);
    } else {
      page.imageHtml = ""
    }

    if (page.preamble) {
      page.preambleHtml = preambleTemplate(page);
    } else {
      page.preambleHtml = ""
    }

    if (page.conclusion) {
      page.conclusionHtml = conclusionTemplate(page);
    } else {
      page.conclusionHtml = ""
    }

    page.header = header[0];
    page.footer = footer[0];
    
    page.sectionsHtml = [];
    for (let i = 0; i < page.sections.length; i++) {
      page.sectionsHtml.push(sectionOutput[page.sections[i]]);
    }

    retArray.push({link: page.link, output: pageTemplate( page )});
    //fs.writeFileSync('./dist/' + name + '/' + page.link + '.html', pageOutput[i]);
  }
  //Writes out the html file and then saves it to a txt.
  return retArray;
}

function writePages(name, pageOutput) {
  for (let i = 0; i < pageOutput.length; i++){
    fs.writeFileSync('./dist/' + name + '/' + pageOutput[i].link + '.html', pageOutput[i].output);
  }

}

export default function generate() {
  const orgData = getData("org");
  const pageData = getData("pages");
  const sectionsData = getData("sections");
  const headerTemplate = template(fs.readFileSync('./templates/default/header.tpl.html', 'utf8'));
  const footerTemplate = template(fs.readFileSync('./templates/default/footer.tpl.html', 'utf8'));
  
  orgData.header[0].html = headerTemplate({logo: orgData.header[0].logo});
  //Puts the header from org through the headerTemplate and saves it in headerOuput.
  orgData.footer[0].html = footerTemplate({contact: orgData.footer[0].contact});
  //Does the same thing with header, but with footer.
  createDistFolder(orgData.name)
  //Makes a folder for the organization which we're going to save a file for.
  //Is supposed to delete the file if it already exists.

  const sectionOutput = generateSections(orgData.theme, sectionsData.sections);

  const pageOutput = generatePages(pageData.pages,
    orgData.footer,
    orgData.header,
    sectionOutput, );

  writePages(orgData.name, pageOutput);
}