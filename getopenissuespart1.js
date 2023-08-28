const XLSX = require("xlsx");
const axios = require("axios");
const json2xls = require("json2xls");

const githubToken = "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"; // replace with your GitHub token

axios.defaults.headers.common["Authorization"] = `token ${githubToken}`;

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexistpart1.xlsx"
); // replace with your file path
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

const getAllOpenIssuesForRepo = async (owner, repo) => {
  let page = 1;
  let issues = [];
  while (true) {
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          params: {
            state: "open",
            per_page: 100,
            page: page,
          },
        }
      );
      if (res.data.length === 0) break;
      issues = issues.concat(res.data);
      page++;
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        break; // if we get an error status, break the loop
      } else {
        throw error; // if it's another type of error, re-throw it
      }
    }
  }
  return issues;
};

const processRepositories = async () => {
  const result = [];
  const totalRows = data.length;
  let currentRow = 1;
  for (const row of data) {
    const [owner, repo] = row[0].split("/"); // assuming the owner/repository format
    const rowData = { Repository: row[0] };
    try {
      const issues = await getAllOpenIssuesForRepo(owner, repo);
      rowData["Open_Issues"] = issues.length;
      result.push(rowData);
    } catch (error) {
      console.error(`Error processing ${row[0]}:`, error);
    } finally {
      console.log(`Processed ${currentRow} of ${totalRows} rows.`);
      currentRow++;
    }
  }

  // Create new Excel file
  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/github_open_issues1.xlsx",
    xls,
    "binary"
  );
};

processRepositories();
