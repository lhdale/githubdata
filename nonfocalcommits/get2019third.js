const XLSX = require("xlsx");
const axios = require("axios");

const githubTokens = [
  "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",
  "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",
  "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",
  "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",
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

const getCommitsForRepo = async (username, repoName, fromDate, toDate) => {
  try {
    const res = await makeRequest(
      `https://api.github.com/repos/${username}/${repoName}/commits`,
      {
        since: fromDate,
        until: toDate,
        per_page: 100,
        page: 1,
      }
    );
    return res;
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

  const months = [
    {
      name: "September",
      fromDate: "2019-09-01T00:00:00Z",
      toDate: "2019-09-30T23:59:59Z",
    },
    {
      name: "October",
      fromDate: "2019-10-01T00:00:00Z",
      toDate: "2019-10-31T23:59:59Z",
    },
    {
      name: "November",
      fromDate: "2019-11-01T00:00:00Z",
      toDate: "2019-11-30T23:59:59Z",
    },
    {
      name: "December",
      fromDate: "2019-12-01T00:00:00Z",
      toDate: "2019-12-31T23:59:59Z",
    },
    // Add other months here
  ];

  for (const row of data) {
    const username = row[0];
    const userData = { Username: username };

    for (const month of months) {
      let totalCommits = 0;
      try {
        const repositories = await getRepositoriesForUser(username);
        for (const repo of repositories) {
          const commits = await getCommitsForRepo(
            username,
            repo,
            month.fromDate,
            month.toDate
          );
          totalCommits += commits.length;
        }
        userData[month.name] = totalCommits;
      } catch (error) {
        console.error(`Error processing ${username} for ${month.name}:`, error);
      }
    }

    result.push(userData);
    console.log(
      `Processed ${currentRow} of ${totalRows} rows. Current Username: ${username}`
    );
    currentRow++;
  }

  const xls = XLSX.utils.json_to_sheet(result);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, xls, "CommitData");
  XLSX.writeFile(
    newWorkbook,
    "C:/Users/luked/OneDrive/Documents/nonfocal2019third.xlsx"
  );
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

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx"
);
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

processUsernames();
