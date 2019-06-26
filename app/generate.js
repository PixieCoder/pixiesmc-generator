import { template } from 'lodash';
import { getData } from './data';
import fs from 'fs';

export default function generate() {
  const orgData = getData("org");
  const pageData = getData("pages");
  const sectionsData = getData("sections");
  let headerTemplate = template(fs.readFileSync('./templates/default/header.tpl.html', 'utf8'));
  orgData.header[0].html = headerTemplate({logo: orgData.header[0].logo});
    //Puts the header from org through the headerTemplate and saves it in headerOuput.
  
  let footerTemplate = template(fs.readFileSync('./templates/default/footer.tpl.html', 'utf8'));
  orgData.footer[0].html = footerTemplate({contact: orgData.footer[0].contact});
    //Does the same thing with header, but with footer.

  //const fs = require("fs");
  const nameOutput = orgData.name;
  const titleOutput = orgData.title;
  if (fs.existsSync('./distfolder/' + nameOutput)) {

    //fs.rmdir('./distfolder/' + titleOutput);

  } else {
    fs.mkdirSync('./distfolder/' + nameOutput, {recursive: false});
  }
    //Makes a folder for the organization which we're going to save a file for.
    //Is supposed to delete the file if it already exists.

  let imageTemplate = template(fs.readFileSync('./templates/default/image.tpl.html', 'utf8'));
  let preambleTemplate = template(fs.readFileSync('./templates/default/preamble.tpl.html', 'utf8'));
  let conclusionTemplate = template(fs.readFileSync('./templates/default/conclusion.tpl.html', 'utf8'));

  let sectionTemplate = template(fs.readFileSync('./templates/default/section.tpl.html', 'utf8'));
  const sectionOutput = [] 

  for (let i = 0; i < sectionsData.sections.length; i++) {

    if (sectionsData.sections[i].image) {

      sectionsData.sections[i].imageHtml = imageTemplate(sectionsData.sections[i].image);

    } else {

      sectionsData.sections[i].imageHtml = ""

    }

    sectionOutput.push(sectionTemplate(
      sectionsData.sections[i]
    ));
      //console.log(sectionOutput);
      fs.writeFileSync('./distfolder/sectionOutput' + i + '.txt',sectionOutput[i]);
  }
    //Does the same thing with header and footer, but with sections.
    //Puts all the information in an array and saves it in sectionOutput'i'.


  let pageTemplate = template(fs.readFileSync('./templates/default/page.tpl.html', 'utf8'));
  const pageOutput = [];

  for (let i = 0; i < pageData.pages.length; i++) {
    
    let page = pageData.pages[i];

    if (page.image) {

      page.imageHtml = imageTemplate(page.image);

    } else {

      page.imageHtml = ""

    }

    //if (page.preamble) {

      //console.log(page);
      //page.preambleHtml = preambleTemplate(page.preamble);

    //} else {

      //page.preambleHtml = ""

    //}

    //if (page.conclusion) {

      //page.conclusionHtml = conclusionTemplate(page);

    //} else {

      //page.conclusionHtml = ""

    //}

    page.header = orgData.header[0];
    page.footer = orgData.footer[0];
    
    page.sectionsHtml = [];
    for (let i = 0; i < page.sections.length; i++) {

      page.sectionsHtml.push(sectionOutput[page.sections[i]]);

    }

    pageOutput.push(pageTemplate( page ));

    fs.writeFileSync('./distfolder/' + page.link + '.html', pageOutput[i]);

  }
    //Writes out the html file and then saves it to a txt.




}


