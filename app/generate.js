import { template } from 'lodash';
import fs from 'fs';
import { getData } from './data';
import { deleteFolderRecursive, copyFolderContentsRecursive } from './utils';

function createDistFolder(name) {
  const distName = `./dist/${name}`;
  deleteFolderRecursive(distName);

  fs.mkdirSync(distName, { recursive: true });
}

function importAssets(name, theme) {
  if (fs.existsSync(`./templates/${theme}/assets`)) {
    copyFolderContentsRecursive(`./templates/${theme}/assets`, `./dist/${name}`);
  }
}

function generateHeader(components) {
  const {
    theme,
    logo,
    logoUrl,
    logoDescription,
    headerTagline,
  } = components;
  const headerTemplate = template(fs.readFileSync(`./templates/${theme}/header.tpl.html`, 'utf8'));
  if (!logo) {
    throw new Error('Header must have logo');
  }
  return headerTemplate({
    url: logoUrl,
    description: logoDescription,
    tagline: headerTagline,
  });
}

function generateSections(theme, sections, imageOutput) {
  const retArray = [];
  const sectionTemplate = template(fs.readFileSync(`./templates/${theme}/section.tpl.html`, 'utf8'));

  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];

    if (section.image) {
      const image = imageOutput.find((element) => {
        if (element.id === section.image.id) {
          return true;
        }
        return false;
      });

      section.imageHtml = image.html;
    } else {
      section.imageHtml = '';
    }

    retArray.push({ html: sectionTemplate(section), id: section.id });
  }
  return retArray;
}

function generateImages(theme, images) {
  const retArray = [];
  const imageTemplate = template(fs.readFileSync(`./templates/${theme}/image.tpl.html`, 'utf8'));

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    retArray.push({ html: imageTemplate(image), id: image.id });
  }
  return retArray;
}

function generatePages(renderedComponents) {
  const {
    theme,
    pages,
    defaultHeader,
    defaultFooter,
    sectionOutput,
    imageOutput,
  } = renderedComponents;
  const retArray = [];
  const footerTemplate = template(fs.readFileSync(`./templates/${theme}/footer.tpl.html`, 'utf8'));
  const preambleTemplate = template(fs.readFileSync(`./templates/${theme}/preamble.tpl.html`, 'utf8'));
  const conclusionTemplate = template(fs.readFileSync(`./templates/${theme}/conclusion.tpl.html`, 'utf8'));
  const pageTemplate = template(fs.readFileSync(`./templates/${theme}/page.tpl.html`, 'utf8'));

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];

    if (page.image) {
      const image = imageOutput.find((element) => {
        if (element.id === page.image.id) {
          return true;
        }
        return false;
      });
      if (!image) {
        throw new Error('Image not found.');
      }
      page.imageHtml = image.html;
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

    if (!page.header) {
      page.header = defaultHeader;
    } else {
      page.header.html = generateHeader({
        theme,
        logo: page.header.logo,
        logoUrl: page.header.logo.url,
        logoDescription: page.header.logoDescription,
        headerTagline: page.header.tagline,
      });
    }

    if (!page.footer) {
      page.footer = defaultFooter;
    } else {
      page.footer.html = footerTemplate({ contact: page.footer.email });
    }

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
  const { Org: orgData } = await getData('org', orgId);
  const pageData = await getData('pages', orgId);
  const sectionData = await getData('sections', orgId);
  const imageData = await getData('images', orgId);

  if (!fs.existsSync(`./templates/${orgData.theme}`)) {
    throw new Error('Template folder not found.');
  }

  const footerTemplate = template(fs.readFileSync(`./templates/${orgData.theme}/footer.tpl.html`, 'utf8'));

  orgData.defaultHeader.html = generateHeader({
    theme: orgData.theme,
    logo: orgData.defaultHeader.logo,
    logoUrl: orgData.defaultHeader.logo.url,
    logoDescription: orgData.defaultHeader.logoDescription,
    headerTagline: orgData.defaultHeader.tagline,
  });

  orgData.defaultFooter.html = footerTemplate({ contact: orgData.defaultFooter.email });

  createDistFolder(orgData.name);
  importAssets(orgData.name, orgData.theme);

  const imageOutput = generateImages(orgData.theme, imageData.allImages);

  const sectionOutput = generateSections(orgData.theme, sectionData.allSections, imageOutput);

  const pageOutput = generatePages({
    theme: orgData.theme,
    pages: pageData.allPages,
    defaultHeader: orgData.defaultHeader,
    defaultFooter: orgData.defaultFooter,
    sectionOutput,
    imageOutput,
  });

  writePages(orgData.name, pageOutput);
}

export default async function generate() {
  const { allOrgs } = await getData('allOrgs');

  for (let i = 0; i < allOrgs.length; i += 1) {
    const orgId = allOrgs[i].id;
    processOrg(orgId);
  }
}
