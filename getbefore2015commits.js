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

const getAllCommitsBefore2015 = async (username, repo) => {
  let page = 1;
  let commitCount = 0;
  while (true) {
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${repo}/commits`,
        {
          params: {
            author: username,
            until: `2015-01-01T00:00:00Z`,
            per_page: 100, // You can adjust this value as needed
            page: page,
          },
        }
      );
      if (res.data.length === 0) break;
      commitCount += res.data.length;
      page++;
    } catch (error) {
      console.error(`Error processing ${username} for ${repo}:`, error);
      break;
    }
  }
  return commitCount;
};

const processUsers = async () => {
  const result = [];
  for (const row of data) {
    const username = row[0]; // user name is in the first column
    const repo = row[1]; // repository is in the second column
    console.log(`Processing user: ${username} for repository: ${repo}`);
    const rowData = { Username: username, Repository: repo };
    try {
      const commitCount = await getAllCommitsBefore2015(username, repo);
      rowData["Commits_Before_2015"] = commitCount;
    } catch (error) {
      console.error(`Error processing ${username} for ${repo}:`, error);
      rowData["Commits_Before_2015"] = "";
    }
    result.push(rowData);
  }

  // Create new Excel file
  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/githubcommitcount_before2015.xlsx",
    xls,
    "binary"
  );
};

processUsers();
