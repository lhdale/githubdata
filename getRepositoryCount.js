const axios = require("axios");
const XLSX = require("xlsx");

// GitHub authentication key
const authKey =
  "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";

// Function to fetch the number of repositories for a GitHub username
const getRepositoryCount = async (username) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `Token ${authKey}`,
        },
      }
    );
    return response.data.public_repos;
  } catch (error) {
    console.error(`Error fetching repository count for ${username}:`, error);
    return null;
  }
};

// Function to process the Excel file
const processExcel = async (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const updatedData = await Promise.all(
    jsonData.map(async (row) => {
      const username = row[0];
      const repoCount = await getRepositoryCount(username);
      return [username, repoCount];
    })
  );

  const updatedWorkbook = XLSX.utils.book_new();
  const updatedWorksheet = XLSX.utils.aoa_to_sheet(updatedData);
  XLSX.utils.book_append_sheet(
    updatedWorkbook,
    updatedWorksheet,
    "Repository Count"
  );

  XLSX.writeFile(
    updatedWorkbook,
    "C:/Users/luked/OneDrive/Documents/githubrepositorycount.xlsx"
  );
  console.log("Excel file processing complete.");
};

// Example usage
const excelFilePath =
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx";
processExcel(excelFilePath);
