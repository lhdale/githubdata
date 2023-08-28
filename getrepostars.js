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

const getStarsCount = async (owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );
    if (res.status === 200) {
      return res.data.stargazers_count;
    } else {
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status >= 400) {
      return null;
    } else {
      throw error;
    }
  }
};

const processUsers = async () => {
  const result = [];
  for (const row of data) {
    const repository = row[1]; // repository is in the second column
    const [owner, repo] = repository.split("/");
    const rowData = { Repository: repository };
    try {
      const starsCount = await getStarsCount(owner, repo);
      if (starsCount !== null) {
        rowData["Stars"] = starsCount;
      } else {
        rowData["Stars"] = "";
      }
    } catch (error) {
      console.error(`Error processing ${repository}:`, error);
      rowData["Stars"] = "";
    }
    result.push(rowData);
  }

  // Create new Excel file
  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/githubstarscount.xlsx",
    xls,
    "binary"
  );
};

processUsers();
