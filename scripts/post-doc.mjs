/**
 * Generates an index.json file in microphi/src/assets/docs so that all subfolder are listed there
 */



import { readdir, writeFile } from 'fs';
import { join } from 'path';

const basePath = process.cwd();
const container = join(basePath, 'projects', 'microphi', 'src', 'assets', 'docs');

readdir(container, (err, files) => {
  if (err) {
    throw err;
  }

  const json = files.filter((file) => {
    return file !== 'index.json'
  }).map((folder) => {
    return {
      name: folder,
      uri: `/assets/docs/${folder}/documentation.json`
    };
  });


  writeFile(join(container, 'index.json'), JSON.stringify(json), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
});
