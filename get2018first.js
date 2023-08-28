const XLSX = require("xlsx");
const axios = require("axios");
const json2xls = require("json2xls");

const githubToken =
  "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"; // replace with your GitHub token

axios.defaults.headers.common["Authorization"] = `token ${githubToken}`;

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx"
); // replace with your file path
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

const getCommitsForMonth = async (username, repo, year, month) => {
  let page = 1;
  let commitCount = 0;
  while (true) {
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${repo}/commits`,
        {
          params: {
            author: username,
            since: `${year}-${month}-01T00:00:00Z`,
            until: `${year}-${month + 1}-01T00:00:00Z`,
            page: page,
          },
        }
      );
      if (res.data.length === 0) break;
      commitCount += res.data.length;
      page++;
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        break; // if we get an error status, break the loop
      } else {
        throw error; // if it's another type of error, re-throw it
      }
    }
  }
  return commitCount;
};

const processUsers = async () => {
  const result = [];
  for (const row of data) {
    const username = row[0]; // user name is in the first column
    const repo = row[1]; // repository is in the second column
    const rowData = { Username: username };
    for (let month = 1; month <= 4; month++) {
      try {
        const commitCount = await getCommitsForMonth(
          username,
          repo,
          2018,
          month
        );
        rowData[`Commits_2018_${month}`] = commitCount;
      } catch (error) {
        console.error(
          `Error processing ${username} for month ${month}:`,
          error
        );
        rowData[`Commits_2018_${month}`] = "";
      }
    }
    result.push(rowData);
  }

  // Create new Excel file
  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/githubcommitcount2018first2.xlsx",
    xls,
    "binary"
  );
};

processUsers();
