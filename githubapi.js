const fs = require("fs");
const axios = require("axios");
const XLSX = require("xlsx");

// Function to fetch email for a GitHub username
async function getEmailForUsername(username, token) {
  const url = `https://api.github.com/users/${username}`;
  const headers = {
    Authorization: `token ${token}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const { email } = response.data;
    return email;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`No GitHub user found for username: ${username}`);
    } else {
      console.log(`Error fetching GitHub user for username: ${username}`);
    }
    return null;
  }
}

// Read the Excel file
const workbook = XLSX.readFile(
  "C:/Users/luked/OneDrive/Documents/usernamesthatdoexist.xlsx"
);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Get the GitHub usernames from the first column
const usernames = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

// Prepare data for the new Excel file
const newData = [["Username", "Email"]];

// Process each username
(async () => {
  for (const { A: username } of usernames) {
    const email = await getEmailForUsername(
      username,
      "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"
    );
    if (email) {
      newData.push([username, email]);
    } else {
      console.log(`No public email found for username: ${username}`);
    }
  }

  // Write the new Excel file
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
  XLSX.writeFile(newWorkbook, "output.xlsx");

  console.log("C:/Users/luked/OneDrive/Documents/CopyOfGit11.xlsx");
})();
