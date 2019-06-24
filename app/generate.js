import { template } from 'lodash';
import { getData } from './data';
import fs from 'fs';

export default function generate() {
  const orgData = getData("org");
  let headerTemplate = template(fs.readFileSync('./templates/default/header.tpl.html', 'utf8'));
  const headerOutput = headerTemplate({logo: orgData.header[0].logo});
  //console.log(headerOutput);

  let footerTemplate = template(fs.readFileSync('./templates/default/footer.tpl.html', 'utf8'));
  const footerOutput = footerTemplate({contact: orgData.footer[0].contact});
  //console.log(footerOutput);

  const sectionsData = getData("sections");
  let sectionTemplate = template(fs.readFileSync('./templates/default/section.tpl.html', 'utf8'));
  const sectionOutput = []
  sectionOutput.push(sectionTemplate({
  title: sectionsData.section[0].title,
  text: sectionsData.section[0].text,
  file: sectionsData.section[0].file,
  caption: sectionsData.section[0].caption,
  description: sectionsData.section[0].description}));
  console.log(sectionOutput);

  let pageTemplate = template(fs.readFileSync('./templates/default/page.tpl.html', 'utf8'));
  const pageOutput = pageTemplate({
    title: "test",
    sections: [],
    header: {
      html: headerOutput,
    },
    footer: {
      html: footerOutput
    },
  });
  console.log(pageOutput);
  fs.writeFileSync('./distfolder/pageOutput.json', JSON.stringify(pageOutput));
}


