const algoliasearch = require("algoliasearch");
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
const Asciidoctor = require('asciidoctor');
const asciidoctor = Asciidoctor();
const { convert } = require('html-to-text');
const git = simpleGit(__dirname);

function resolvePath(...args) {
  return path.resolve(__dirname, ...args)
}

if (process.argv.length < 5) {
  throw new Error("Failed to find proper settings for Algolia indexing");
}
const algoliaAppId = process.argv[2];
const algoliaApiKey = process.argv[3];
const algoliaIndexNamePrefix = process.argv[4];

if (!algoliaAppId || !algoliaApiKey || !algoliaIndexNamePrefix) {
  throw new Error("Please setup Algolia settings in GitHub Action Secrets");
}

const initBranch = async () => {
  const status = await git.status();
  let currentBranch = status.tracking;
  currentBranch = currentBranch.split("/")[1];
  console.log(`Indexing articles on branch "${currentBranch}" ...`);
  startIndexing(currentBranch);
};

initBranch();

const startIndexing = (currentBranch) => {
  const client = algoliasearch(algoliaAppId, algoliaApiKey);
  const algoliaIndex = client.initIndex(
    `${algoliaIndexNamePrefix}-${currentBranch}`
  );
  const commonPath = resolve("../", "components");

  fs.readdir(commonPath, "utf8", (err, data) => {
    if (err) {
      console.error(err, "err");
      return;
    }
    data.forEach((item) => {
      const nextPath = path.join(commonPath, item, "modules");
      fs.readdir(nextPath, "utf8", (errNext, dataNext) => {
        if (errNext) {
          console.error(errNext, "err_next");
          return;
        }
        dataNext.forEach((listItem) => {
          const pagePathFold = path.join(nextPath, listItem, "pages");
          fs.readdir(pagePathFold, "utf8", (pageErr, pageData) => {
            if (pageErr) {
              console.error(pageErr, "pageErr");
              return;
            }
            pageData.forEach((target) => {
              const targetPath = path.join(pagePathFold, target);
              const stat = fs.lstatSync(targetPath);
              if (stat.isDirectory()) {
                fs.readdir(targetPath, "utf-8", (fileErr, fileData) => {
                  if (fileErr) {
                    console.log(fileErr, "fileErr");
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
      if (stat.isFile() && path.extname(target) === ".adoc") {
        fs.readFile(targetPath, "utf-8", (err, data) => {
          if (err) {
            console.error(err, "beforeUpload");
            return;
          }
          const titleFromAscii = data.split("\n").find(str => str.slice(0,2) === '= ')?.split("=")[1] ?? ""
          const titleFromMK = data.split("\n").find(str => str.slice(0,2) === '# ')?.split("#")[1] ?? ""
          const title = (titleFromAscii || titleFromMK).trim()

          const html = asciidoctor.convertFile(targetPath, { to_file: false, standalone: true });
          const text = convert(html, {
            wordwrap: 130
          });
          const recode = {
            objectID: targetPath.substring(targetPath.indexOf("modules") + 7),
            title: title,
            content: text,
          };
          uploadFile(recode, targetPath);
        });
      }
    }

    function uploadFile(file, targetPath) {
      const url = targetPath
        .split("modules")[1]
        .replace("/pages", "")
        .replace(".adoc", "")
        .replace("ROOT/index", "")
        .replace("index", "")
      const record = {
        url: "https://docs.starknet.io/documentation" + url,
        ...file,
      };
      algoliaIndex.saveObject(record).wait();
      console.log("Done indexing ===>", url);
      console.log("Saved record title ===>", record.title);
      console.log("Saved record url ===>", record.url);
    }
  });
};
