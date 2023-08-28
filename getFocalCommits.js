const axios = require("axios");
const XLSX = require("xlsx");

// GitHub authentication key
const authKey =
  "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";

// Function to fetch all commits for a username and repository combination
const getAllCommits = async (owner, repository, username) => {
  let commitCount = 0;
  let page = 1;

  try {
    while (true) {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repository}/commits`,
        {
          headers: {
            Authorization: `Token ${authKey}`,
          },
          params: {
            author: username,
            per_page: 100, // Fetches up to 100 commits per page
            page,
          },
        }
      );

      if (response.data.length === 0) {
        break; // No more commits available
      }

      const filteredCommits = response.data.filter((commit) => {
        const commitDate = new Date(commit.commit.author.date);
        return commitDate.getFullYear() >= 2015; // Filter by dates after 2015
      });

      commitCount += filteredCommits.length;
      page++;
    }

    return commitCount;
  } catch (error) {
    console.error(
      `Error fetching commits for ${username}/${owner}/${repository}:`,
      error.message
    );
    return null;
  }
};

// Function to process the Excel file
const processExcel = async (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const updatedData = [];

  for (const row of jsonData) {
    const username = row[0];
    const repositoryCell = row[1];
    const [owner, repository] = repositoryCell.split("/");

    const commitCount = await getAllCommits(owner, repository, username);

    if (commitCount !== null) {
      updatedData.push([username, owner, repository, commitCount]);
    } else {
      updatedData.push([username, owner, repository, ""]); // Leave cell blank if there was an error
    }
  }

  const updatedWorkbook = XLSX.utils.book_new();
  const updatedWorksheet = XLSX.utils.aoa_to_sheet(updatedData);
  XLSX.utils.book_append_sheet(
    updatedWorkbook,
    updatedWorksheet,
    "Commit Count"
  );

  XLSX.writeFile(
    updatedWorkbook,
    "C:/Users/luked/OneDrive/Documents/githubfocalfiltered.xlsx"
  );
  console.log("Excel file processing complete.");
};

// Example usage
const excelFilePath =
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx";
processExcel(excelFilePath);
