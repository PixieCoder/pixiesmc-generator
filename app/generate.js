import { template } from 'lodash';
import fs from 'fs';
import { getData } from './data';
import { deleteFolderRecursive, copyFolderContentsRecursive, saveImage } from './utils';

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

function createFolder(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function generateHeader(components) {
  const {
    theme,
    orgName,
    logo,
    logoDescription,
    headerTagline,
    langMenu,
    pageMenus,
    lang,
    defaultLang,
  } = components;

  const webRoot = defaultLang.id === lang.id ? './' : '../';
  const pageMenu = pageMenus.find(menu => menu.id === lang.id) || '';
  const headerTemplate = template(fs.readFileSync(`./templates/${theme}/header.tpl.html`, 'utf8'));
  if (!logo) {
    throw new Error('Header must have logo');
  }

  saveImage(`./dist/${orgName}/img/`, logo.name, logo.url);
  return headerTemplate({
    logo,
    description: logoDescription,
    tagline: headerTagline,
    langMenu,
    pageMenu,
    webRoot,
  });
}

async function generateSections(renderedComponents) {
  const {
    theme,
    sections,
    imageOut,
    name,
  } = renderedComponents;

  const retArray = [];
  const saveImageArray = [];
  const sectionTemplate = template(fs.readFileSync(`./templates/${theme}/section.tpl.html`, 'utf8'));

  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];

    if (section.image) {
      const image = imageOut.find((element) => {
        if (element.id === section.image.id) {
          return true;
        }
        return false;
      });
      section.imageHtml = image.html;
      saveImageArray.push(saveImage(`./dist/${name}/img/`, image.file.name, image.file.url));
    } else {
      section.imageHtml = '';
    }

    retArray.push({ html: sectionTemplate(section), id: section.id });
  }
  await Promise.all(saveImageArray);
  return retArray;
}

function generateImages(theme, images, defaultLang) {
  const retArray = [];
  const imageTemplate = template(fs.readFileSync(`./templates/${theme}/image.tpl.html`, 'utf8'));

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    image.webRoot = defaultLang.id === image.lang.id ? './' : '../';
    retArray.push({
      html: imageTemplate(image),
      id: image.id,
      file: image.file,
    });
  }
  return retArray;
}

function generateLangMenu(org, pages) {
  const { defaultLang, theme } = org;
  const langs = [];
  const webRoot = '/';
  for (let i = 0; i < pages.length; i += 1) {
    const { lang } = pages[i];
    if (lang.id !== defaultLang.id && !langs.find(element => element.id === lang.id)) {
      langs.push(lang);
    }
  }

  if (langs.length < 1) { //  defaultLang is not in langs array.
    return '';
  }
  const langMenuTemplate = template(fs.readFileSync(`./templates/${theme}/langMenu.tpl.html`, 'utf8'));
  return langMenuTemplate({ defaultLang, langs, webRoot });
}

function generatePageMenus(org, pages) {
  const { theme } = org;
  const retArray = [];
  const langs = [];
  const pageMenuTemplate = template(fs.readFileSync(`./templates/${theme}/pageMenu.tpl.html`, 'utf8'));

  for (let i = 0; i < pages.length; i += 1) {
    const { lang } = pages[i];
    if (!langs.find(element => element.id === lang.id)) {
      langs.push(lang);
    }
  }

  for (let i = 0; i < langs.length; i += 1) {
    const currentLang = langs[i];
    const webRoot = org.defaultLang.id === currentLang.id ? '/' : `/${currentLang.link}/`;
    const menuPages = pages.filter(page => page.lang.id === currentLang.id && page.menuStatus !== 'None');

    if (menuPages.length > 1) {
      retArray.push({
        ...currentLang,
        html: pageMenuTemplate({
          menuPages,
          webRoot,
        }),
      });
    }
  }
  return retArray;
}

async function generatePages(renderedComponents) {
  const {
    theme,
    pages,
    defaultHeaders,
    defaultFooters,
    name,
    sectionOutput,
    imageOutput,
    langMenu,
    pageMenus,
    defaultLang,
  } = renderedComponents;
  const retArray = [];
  const saveImageArray = [];
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
      saveImageArray.push(saveImage(`./dist/${name}/img/`, image.file.name, image.file.url));
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
      page.header = defaultHeaders.find(header => header.lang.id === page.lang.id);
    } else {
      page.header.html = generateHeader({
        ...page.header,
        theme,
        orgName: name,
        langMenu,
        pageMenus,
        defaultLang,
      });
    }

    if (!page.footer) {
      page.footer = defaultFooters.find(footer => footer.lang.id === page.lang.id);
    } else {
      page.footer.html = footerTemplate({
        address: page.footer.address,
        town: page.footer.town,
        email: page.footer.email,
        phone: page.footer.phone,
      });
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

    retArray.push({ link: page.link, output: pageTemplate(page), lang: page.lang });
  }
  await Promise.all(saveImageArray);
  return retArray;
}

function writePages(name, defaultLang, pageOutput) {
  for (let i = 0; i < pageOutput.length; i += 1) {
    if (pageOutput[i].lang.id !== defaultLang.id) {
      createFolder(`./dist/${name}/${pageOutput[i].lang.link}`);
      fs.writeFileSync(`./dist/${name}/${pageOutput[i].lang.link}/${pageOutput[i].link}.html`, pageOutput[i].output);
    } else {
      fs.writeFileSync(`./dist/${name}/${pageOutput[i].link}.html`, pageOutput[i].output);
    }
  }
}

async function processOrg(orgId) {
  const { Org: orgData } = await getData('org', orgId);
  const templateFolder = `./templates/${orgData.theme}`;
  const pageData = await getData('pages', orgId);
  const sectionData = await getData('sections', orgId);
  const imageData = await getData('images', orgId);

  if (!fs.existsSync(templateFolder)) {
    return;
    //  TODO: remove above line.
    throw new Error(`Template folder not found: ${templateFolder}`);
  }

  const langMenu = generateLangMenu(orgData, pageData.allPages);
  const pageMenus = generatePageMenus(orgData, pageData.allPages);
  const footerTemplate = template(fs.readFileSync(`./templates/${orgData.theme}/footer.tpl.html`, 'utf8'));

  if (orgData.defaultHeaders.length < 1) {
    throw new Error('Missing defaultheader');
  }
  for (let i = 0; i < orgData.defaultHeaders.length; i += 1) {
    orgData.defaultHeaders[i].html = generateHeader({
      theme: orgData.theme,
      orgName: orgData.name,
      logo: orgData.defaultHeaders[i].logo,
      logoDescription: orgData.defaultHeaders[i].logoDescription,
      headerTagline: orgData.defaultHeaders[i].tagline,
      langMenu,
      pageMenus,
      lang: orgData.defaultHeaders[i].lang,
      defaultLang: orgData.defaultLang,
    });
  }

  if (orgData.defaultFooters.length < 1) {
    throw new Error('Missing defaultfooter');
  }
  for (let i = 0; i < orgData.defaultFooters.length; i += 1) {
    orgData.defaultFooters[i].html = footerTemplate(orgData.defaultFooters[i]);
  }

  createDistFolder(orgData.name);
  importAssets(orgData.name, orgData.theme);

  const imageOutput = generateImages(orgData.theme, imageData.allImages, orgData.defaultLang);

  const sectionOutput = await generateSections({
    ...orgData,
    sections: sectionData.allSections,
    imageOut: imageOutput,
  });

  const pageOutput = await generatePages({
    ...orgData,
    pages: pageData.allPages,
    sectionOutput,
    imageOutput,
    langMenu,
    pageMenus,
  });

  writePages(orgData.name, orgData.defaultLang, pageOutput);
}

export default async function generate() {
  const { allOrgs } = await getData('allOrgs');

  for (let i = 0; i < allOrgs.length; i += 1) {
    const orgId = allOrgs[i].id;
    processOrg(orgId);
  }
}
