import fs from 'fs';

export function deleteFolderRecursive(path) {
  
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            const currentPath = path + "/" + file;
            if (fs.lstatSync(currentPath).isDirectory()) { // recurse
                deleteFolderRecursive(currentPath);
            } else { // delete file
                fs.unlinkSync(currentPath);
            }
        });
        fs.rmdirSync(path);
    }
};
