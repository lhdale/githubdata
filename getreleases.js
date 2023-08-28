const XLSX = require("xlsx");
const axios = require("axios");
const json2xls = require("json2xls");

const githubToken = "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"; // replace with your GitHub token

axios.defaults.headers.common["Authorization"] = `token ${githubToken}`;

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx"
); // replace with your file path
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getNumberOfReleasesForRepo = async (repository) => {
  let page = 1;
  let releases = [];
  while (true) {
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${repository}/releases`,
        {
          params: {
            per_page: 100, // GitHub allows a maximum of 100 releases per page
            page: page,
          },
        }
      );
      if (res.data.length === 0) break;
      releases = releases.concat(res.data);
      page++;
      await delay(500); // Introduce a 500ms delay between API requests
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        break; // if we get an error status, break the loop
      } else {
        throw error; // if it's another type of error, re-throw it
      }
    }
  }
  return releases.length;
};

const processRepositories = async () => {
  const result = [];
  const totalRows = data.length;
  let currentRow = 1;
  for (const row of data) {
    const repository = row[1]; // assuming the owner/repository format is in the second column
    const rowData = { Repository: repository };
    try {
      const releasesCount = await getNumberOfReleasesForRepo(repository);
      rowData["Number_of_Releases"] = releasesCount;
      result.push(rowData);
    } catch (error) {
      console.error(`Error processing ${repository}:`, error);
    } finally {
      console.log(`Processed ${currentRow} of ${totalRows} rows.`);
      currentRow++;
    }
  }

  // Create new Excel file
  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/github_number_of_releases.xlsx",
    xls,
    "binary"
  );
};

processRepositories();
