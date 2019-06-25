import { template } from 'lodash';
import { getData } from './data';
import fs from 'fs';

export default function generate() {
  const orgData = getData("org");
  let headerTemplate = template(fs.readFileSync('./templates/default/header.tpl.html', 'utf8'));
  const headerOutput = headerTemplate({logo: orgData.header[0].logo});
  //console.log(headerOutput);
    //Puts the header from org through the headerTemplate and saves it in headerOuput.
  
  let footerTemplate = template(fs.readFileSync('./templates/default/footer.tpl.html', 'utf8'));
  const footerOutput = footerTemplate({contact: orgData.footer[0].contact});
  //console.log(footerOutput);
    //Does the same thing with header, but with footer.

  const sectionsData = getData("sections");
  let sectionTemplate = template(fs.readFileSync('./templates/default/section.tpl.html', 'utf8'));
  const sectionOutput = []

  var i;
  for (i = 0; i < sectionsData.sections.length; i++) {

    sectionOutput.push(sectionTemplate({
      title: sectionsData.sections[i].title,
      text: sectionsData.sections[i].text,
      file: sectionsData.sections[i].file,
      caption: sectionsData.sections[i].caption,
      description: sectionsData.sections[i].description}));
      console.log(sectionOutput);
      fs.writeFileSync('./distfolder/sectionOutput' + i + '.txt',sectionOutput[i]);
  }
    //Does the same thing with header and footer, but with sections.
    //Puts all the information in an array and saves it in sectionOutput'i'.

  //const fs = require("fs");
  const nameOutput = orgData.name;
  const titleOutput = orgData.title;
  if (fs.existsSync('./distfolder/' + titleOutput)) {

    //fs.rmdir('./distfolder/' + titleOutput);

  } else {
    
    fs.mkdirSync('./distfolder/' + nameOutput, {recursive: false});

  }
    //Makes a folder for the organization which we're going to save a file for.
    //Is supposed to delete the file if it already exists.

  let pageTemplate = template(fs.readFileSync('./templates/default/page.tpl.html', 'utf8'));
  const pageOutput = pageTemplate({
    title: titleOutput,
    sections: [],
    header: {
      html: headerOutput,
    },
    footer: {
      html: footerOutput
    },
  });
  console.log(pageOutput);
  fs.writeFileSync('./distfolder/' + nameOutput + '/pageOutput.txt',pageOutput);
    //Writes out the html file and then saves it to a txt.

}


