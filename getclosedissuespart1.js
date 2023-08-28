const XLSX = require("xlsx");
const axios = require("axios");
const json2xls = require("json2xls");

const githubTokens = [
  // Add your GitHub tokens here
  "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",
  "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",
  "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",
  "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",
  // Add more tokens as needed
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let currentTokenIndex = 0;

const getNextToken = () => {
  currentTokenIndex = (currentTokenIndex + 1) % githubTokens.length;
  return githubTokens[currentTokenIndex];
};

const makeRequest = async (url, params) => {
  const token = getNextToken();
  try {
    const response = await axios.get(url, {
      params,
      headers: {
        Authorization: `token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      if (error.response.headers["x-ratelimit-remaining"] === "0") {
        console.log("Rate limit exceeded for token:", token);
        await delay(60000); // Wait for 1 minute before trying again
        return makeRequest(url, params);
      }
    }
    throw error;
  }
};

const getAllClosedIssuesForRepo = async (repository) => {
  let page = 1;
  let closedIssues = [];
  while (true) {
    try {
      const res = await makeRequest(
        `https://api.github.com/repos/${repository}/issues`,
        {
          state: "closed",
          per_page: 100,
          page: page,
        }
      );
      if (res.length === 0) break;
      closedIssues = closedIssues.concat(res);
      page++;
      await delay(500);
    } catch (error) {
      console.error(`Error fetching closed issues for ${repository}:`, error);
      throw error;
    }
  }
  return closedIssues.length;
};

const processRepositories = async () => {
  const result = [];
  const totalRows = data.length;
  let currentRow = 1;

  for (const row of data) {
    const repository = row[1];
    const rowData = { Repository: repository };
    try {
      const closedIssuesCount = await getAllClosedIssuesForRepo(repository);
      rowData["Number_of_Closed_Issues"] = closedIssuesCount;
      result.push(rowData);
    } catch (error) {
      console.error(`Error processing ${repository}:`, error);
    } finally {
      console.log(`Processed ${currentRow} of ${totalRows} rows.`);
      currentRow++;
    }
  }

  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/github_closed_issues_count.xlsx",
    xls,
    "binary"
  );
};

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx"
);
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

processRepositories();
