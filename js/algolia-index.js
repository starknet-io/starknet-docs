const algoliasearch = require("algoliasearch");
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
const Asciidoctor = require("asciidoctor");
const asciidoctor = Asciidoctor();
const { convert } = require("html-to-text");
const git = simpleGit(__dirname);

function resolvePath(...args) {
  return path.resolve(__dirname, ...args);
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
  console.log(`Reindexing articles on branch "${currentBranch}" ...`);
  await clearOldIndex(currentBranch);
  startIndexing(currentBranch);
};

const clearOldIndex = async (currentBranch) => {
  const client = algoliasearch(algoliaAppId, algoliaApiKey);
  const algoliaIndex = client.initIndex(
    `${algoliaIndexNamePrefix}-${currentBranch}`
  );

  try {
    console.log(
      `Deleting all old records from index: ${algoliaIndex.indexName}`
    );
    await algoliaIndex.clearObjects();
    console.log("Old index cleared successfully.");
  } catch (error) {
    console.error("Error clearing old index:", error);
  }
};

const startIndexing = (currentBranch) => {
  const client = algoliasearch(algoliaAppId, algoliaApiKey);
  const algoliaIndex = client.initIndex(
    `${algoliaIndexNamePrefix}-${currentBranch}`
  );
  const commonPath = path.resolve("../", "modules");

  fs.readdir(commonPath, "utf8", (err, data) => {
    if (err) {
      console.error(err, "err");
      return;
    }
    data.forEach((listItem) => {
      const pagePathFold = path.join(commonPath, listItem, "pages");
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
                beforeUpload(targetFilePath, targetFile, algoliaIndex);
              });
            });
          }
          beforeUpload(targetPath, target, algoliaIndex);
        });
      });
    });
  });
};

function beforeUpload(targetPath, target, algoliaIndex) {
  const stat = fs.lstatSync(targetPath);
  if (stat.isFile() && path.extname(target) === ".adoc") {
    fs.readFile(targetPath, "utf-8", (err, data) => {
      if (err) {
        console.error(err, "beforeUpload");
        return;
      }
      const titleFromAscii =
        data
          .split("\n")
          .find((str) => str.slice(0, 2) === "= ")
          ?.split("=")[1] ?? "";
      const titleFromMK =
        data
          .split("\n")
          .find((str) => str.slice(0, 2) === "# ")
          ?.split("#")[1] ?? "";
      const title = (titleFromAscii || titleFromMK).trim();

      const html = asciidoctor.convertFile(targetPath, {
        to_file: false,
        standalone: true,
      });
      const text = convert(html, { wordwrap: 130 });
      const recode = {
        objectID: targetPath.substring(targetPath.indexOf("modules") + 7),
        title: title,
        content: text,
      };
      uploadFile(recode, targetPath, algoliaIndex);
    });
  }
}

function uploadFile(file, targetPath, algoliaIndex) {
  const url = targetPath
    .split("modules")[1]
    .replace("/pages", "")
    .replace(".adoc", "")
    .replace("ROOT/", "")
    .replace("index", "");
  const record = {
    url: "https://docs.starknet.io" + url,
    ...file,
  };
  algoliaIndex.saveObject(record).wait();
  console.log("Done indexing ===>", url);
  console.log("Saved record title ===>", record.title);
  console.log("Saved record url ===>", record.url);
}

initBranch();
