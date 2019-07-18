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
  if (fs.existsSync(source)) {
    fs.readdirSync(source).forEach((file) => {
      const currentPath = `${source}/${file}`;
      if (fs.lstatSync(currentPath).isDirectory()) {
        fs.mkdirSync(`${destination}/${file}`);
        copyFolderContentsRecursive(currentPath, `${destination}/${file}`);
      } else {
        fs.copyFileSync(currentPath, `${destination}/${file}`);
      }
    });
  }
}

export default { deleteFolderRecursive, copyFolderContentsRecursive };
