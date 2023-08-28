const XLSX = require("xlsx");
const axios = require("axios");

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

const getRepositoriesForUser = async (username) => {
  try {
    const res = await makeRequest(
      `https://api.github.com/users/${username}/repos`,
      {
        per_page: 100,
        page: 1,
      }
    );
    return res.map((repo) => repo.name);
  } catch (error) {
    if (error.response && error.response.status >= 400) {
      return [];
    } else {
      throw error;
    }
  }
};

const processUsernames = async () => {
  const result = [];
  const totalRows = data.length;
  let currentRow = 1;
  for (const row of data) {
    const username = row[0]; // Assuming usernames are in the first column
    const userData = { Username: username };
    try {
      const repositories = await getRepositoriesForUser(username);
      userData["Repositories"] = repositories;
      result.push(userData);
    } catch (error) {
      console.error(`Error processing ${username}:`, error);
    } finally {
      console.log(
        `Processed ${currentRow} of ${totalRows} rows. Current Username: ${username}`
      );
      currentRow++;
    }
  }

  const xlsResult = result.map((entry) => ({
    Username: entry.Username,
    Repositories: entry.Repositories.join(", "),
  }));

  const xls = XLSX.utils.json_to_sheet(xlsResult);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, xls, "RepositoryData");
  XLSX.writeFile(
    newWorkbook,
    "C:/Users/luked/OneDrive/Documents/repository_data.xlsx"
  );
};

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx"
);
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

processUsernames();
