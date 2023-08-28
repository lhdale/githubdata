const XLSX = require("xlsx");
const axios = require("axios");
const json2xls = require("json2xls");

const githubTokens = [
  "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", // Add your GitHub tokens here
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

const getAllContributorsForRepo = async (repository) => {
  let page = 1;
  let contributors = [];
  while (true) {
    try {
      const res = await makeRequest(
        `https://api.github.com/repos/${repository}/contributors`,
        {
          per_page: 100,
          page: page,
          anon: "true",
        }
      );
      if (res.length === 0) break;
      contributors = contributors.concat(res);
      page++;
      await delay(500);
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        break;
      } else {
        throw error;
      }
    }
  }
  return contributors.length;
};

const processRepositories = async () => {
  const result = [];
  const totalRows = data.length;
  let currentRow = 1;
  for (const row of data) {
    const repository = row[1];
    const rowData = { Repository: repository };
    try {
      const contributorsCount = await getAllContributorsForRepo(repository);
      rowData["Number_of_Contributors"] = contributorsCount;
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
    "C:/Users/luked/OneDrive/Documents/github_number_of_contributors.xlsx",
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
