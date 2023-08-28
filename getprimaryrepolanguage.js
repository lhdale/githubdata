const XLSX = require("xlsx");
const axios = require("axios");
const json2xls = require("json2xls");

const githubToken = "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"; // replace with your GitHub token

axios.defaults.headers.common["Authorization"] = `token ${githubToken}`;

const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/githubusernamesthatdoexist.xlsx"
); // replace with your file path
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  header: 1,
});

const getRepoDetails = async (repoFullName) => {
  try {
    const res = await axios.get(`https://api.github.com/repos/${repoFullName}`);
    return {
      creationDate: res.data.created_at,
      language: res.data.language,
    };
  } catch (error) {
    if (error.response && error.response.status >= 400) {
      return null;
    }
  }
};

const processUsers = async () => {
  const result = [];
  for (const row of data) {
    const repoFullName = row[1]; // repository full name is in the second column
    const rowData = { Repository: repoFullName };
    const repoDetails = await getRepoDetails(repoFullName);

    if (repoDetails !== null) {
      rowData["CreationDate"] = repoDetails.creationDate;
      rowData["Language"] = repoDetails.language;
      result.push(rowData);
    }
  }

  // Create new Excel file
  const xls = json2xls(result);
  require("fs").writeFileSync(
    "C:/Users/luked/OneDrive/Documents/githubrepodetails.xlsx",
    xls,
    "binary"
  );
};

processUsers();
