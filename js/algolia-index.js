const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
const algoliaIndex = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
const commonPath = path.resolve('../', 'components');

fs.readdir(commonPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err, 'err');
    return;
  }
  
  data.forEach((item) => {
    const nextPath = path.join(commonPath, item, 'modules');
    fs.readdir(nextPath, 'utf8', (error, dataNext) => {
      if (error) {
        console.error(error, 'error');
        return;
      }
      dataNext.forEach((listItem) => {
        const pagePathFold = path.join(nextPath, listItem, 'pages');
        fs.readdir(pagePathFold, 'utf8', (pageError, pageData) => {
          if (pageError) {
            console.error(pageError, 'pageError');
            return;
          }
          pageData.forEach((target) => {
            const targetPath = path.join(pagePathFold, target);
            const stat = fs.lstatSync(targetPath);
            if (stat.isDirectory()) {
              fs.readdir(targetPath, 'utf-8', (fileError, fileData) => {
                if (fileError) {
                  console.log(fileError, 'fileError');
                  return;
                }
                fileData.forEach((targetFile) => {
                  const targetFilePath = path.join(targetPath, targetFile);
                  beforeUpload(targetFilePath, targetFile);
                });

              });
            }
            beforeUpload(targetPath, target);
          });
        });
      });
    });
  });

  function beforeUpload(targetPath, target) {
    const stat = fs.lstatSync(targetPath);
    if (stat.isFile() && path.extname(target) === '.adoc') {
      fs.readFile(targetPath, 'utf-8', (err, data) => {
        if (err) {
          console.error(err, 'beforeUpload');
          return;
        }
        const title = data.split('\n')[1].split('=')[1];
        const recode = {
          objectID: targetPath.substring(targetPath.indexOf("modules") + 7),
          title: title,
          content: data
        };
        uploadFile(recode, target);
      });
    }
  }

  function uploadFile(file, target) {
    const record = {
      url: `http://docs.starknet.io/readme`,
      ...file,
    };
    algoliaIndex.saveObject(record).wait();
    console.log('Done indexing ===>', target);
  }
});
