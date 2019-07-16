import fs from 'fs';

export function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const currentPath = `${path}/${file}`;
      if (fs.lstatSync(currentPath).isDirectory()) { // recurse
        deleteFolderRecursive(currentPath);
      } else { // delete file
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function copyFolderContentsRecursive(source, destination) {
//  kolla om destinationen finns, annars skapa den.
//  lista all filer i källan
  //  Om filen är en katalog skapa en katalog vid destinationen med samma namn och kör den här funktionen på den.
  //  om det är en fil, kopiera över filen till destinationen.

  if (fs.existsSync(source)) {
    fs.readdirSync(source).forEach((file) => {
      const currentPath = `${source}/${file}`;
      if (fs.lstatSync(currentPath).isDirectory()) {
        fs.mkdirSync(`${destination}/${file}`);
        copyFolderContentsRecursive(currentPath, destination);
          //  copyFolderCOntentsRecursive destination gör den arg.-kolla efter lunch
      } else {
        fs.copyFileSync(file, destination);
      }
    });
  }
}

export default { deleteFolderRecursive };
