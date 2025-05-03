# OG Marketing

OG Marketing is a business management web application with a Minecraft-inspired design. It allows users to manage their business information, share marketing news, and report restocks.

## Features

- **User Authentication**: Secure login system with predefined user credentials
- **My Business**: Personal dashboard for each user to track sales, revenue, inventory, notes, and goals
- **Marketing News**: Shared platform where all users can post and view marketing news and updates
- **Restock Reporting**: System for users to report when items have been restocked

## How to Use

1. **Login**: Use one of the following credentials to log in:
   - Username: FreakyFaw, Password: Almeno1Lettera
   - Username: FreakyVity, Password: Sborratore
   - Username: enpiesie, Password: Nigger

2. **My Business**: 
   - View your business statistics
   - Add and save business notes
   - Create, complete, and delete business goals

3. **Marketing News**:
   - Post news with a title and content
   - View news posted by all users

4. **Restock Reporting**:
   - Report restocked items with name, quantity, and notes
   - View restock reports from all users

## Technical Details

- Built with HTML, CSS, and JavaScript
- Uses localStorage for data persistence
- Responsive design for mobile and desktop

## Google Sheets Integration Guide

To integrate Google Sheets as a database for this application, follow these steps:

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Create three sheets named:
   - `userData`
   - `newsData`
   - `restockData`

3. Set up the userData sheet with these columns:
   - username
   - notes
   - goals (JSON string)
   - sales
   - revenue
   - inventory

4. Set up the newsData sheet with these columns:
   - id
   - title
   - content
   - author
   - timestamp

5. Set up the restockData sheet with these columns:
   - id
   - itemName
   - quantity
   - notes
   - reporter
   - timestamp

### 2. Deploy as a Web App

1. In Google Sheets, go to Extensions > Apps Script
2. Replace the code with the following:

```javascript
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var operation = e.parameter.operation;
    var sheet = e.parameter.sheet;
    var data = e.parameter.data ? JSON.parse(e.parameter.data) : null;
    
    if (operation === 'read') {
      return readData(ss, sheet);
    } else if (operation === 'write') {
      return writeData(ss, sheet, data);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Invalid operation'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function readData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  var data = getSheetData(sheet);
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'data': data
  })).setMimeType(ContentService.MimeType.JSON);
}

function writeData(ss, sheetName, data) {
  var sheet = ss.getSheetByName(sheetName);
  
  if (sheetName === 'userData') {
    writeUserData(sheet, data);
  } else if (sheetName === 'newsData') {
    writeNewsData(sheet, data);
  } else if (sheetName === 'restockData') {
    writeRestockData(sheet, data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheet) {
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0];
  var result = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    
    result.push(obj);
  }
  
  return result;
}

function writeUserData(sheet, data) {
  // Clear existing data except headers
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Write new data
  var rows = [];
  for (var username in data) {
    var user = data[username];
    rows.push([
      username,
      user.notes,
      JSON.stringify(user.goals),
      user.stats.sales,
      user.stats.revenue,
      user.stats.inventory
    ]);
  }
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}

function writeNewsData(sheet, data) {
  // Clear existing data except headers
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Write new data
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var news = data[i];
    rows.push([
      news.id,
      news.title,
      news.content,
      news.author,
      news.timestamp
    ]);
  }
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  }
}

function writeRestockData(sheet, data) {
  // Clear existing data except headers
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Write new data
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var restock = data[i];
    rows.push([
      restock.id,
      restock.itemName,
      restock.quantity,
      restock.notes,
      restock.reporter,
      restock.timestamp
    ]);
  }
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}
```

3. Save the project with a name like "OG Marketing API"
4. Click on Deploy > New deployment
5. Select "Web app" as the deployment type
6. Set "Execute as" to "Me" and "Who has access" to "Anyone"
7. Click "Deploy" and copy the Web App URL

### 3. Update the JavaScript Code

Modify the `app.js` file to use the Google Sheets API instead of localStorage:

1. Add the Google Sheets API URL at the top of your app.js file:

```javascript
// Google Sheets API URL
const SHEETS_API_URL = 'YOUR_WEB_APP_URL_HERE';
```

2. Replace the `loadData` function with:

```javascript
// Load data from Google Sheets
async function loadData() {
    try {
        // Load user data
        const userDataResponse = await fetch(`${SHEETS_API_URL}?operation=read&sheet=userData`);
        const userDataResult = await userDataResponse.json();
        
        if (userDataResult.status === 'success') {
            // Convert array to object with username as key
            userData = {};
            userDataResult.data.forEach(user => {
                userData[user.username] = {
                    notes: user.notes,
                    goals: JSON.parse(user.goals || '[]'),
                    stats: {
                        sales: user.sales,
                        revenue: user.revenue,
                        inventory: user.inventory
                    }
                };
            });
        }
        
        // Load news data
        const newsDataResponse = await fetch(`${SHEETS_API_URL}?operation=read&sheet=newsData`);
        const newsDataResult = await newsDataResponse.json();
        
        if (newsDataResult.status === 'success') {
            newsData = newsDataResult.data;
        }
        
        // Load restock data
        const restockDataResponse = await fetch(`${SHEETS_API_URL}?operation=read&sheet=restockData`);
        const restockDataResult = await restockDataResponse.json();
        
        if (restockDataResult.status === 'success') {
            restockData = restockDataResult.data;
        }
        
        // Initialize user data if not exists
        users.forEach(user => {
            if (!userData[user.username]) {
                userData[user.username] = {
                    notes: '',
                    goals: [],
                    stats: {
                        sales: 0,
                        revenue: 0,
                        inventory: 0
                    }
                };
            }
        });
        
        // Save initialized data
        saveData();
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize empty data
        userData = {};
        newsData = [];
        restockData = [];
        
        users.forEach(user => {
            userData[user.username] = {
                notes: '',
                goals: [],
                stats: {
                    sales: 0,
                    revenue: 0,
                    inventory: 0
                }
            };
        });
        
        saveData();
    }
}
```

3. Replace the `saveData` function with:

```javascript
// Save data to Google Sheets
async function saveData() {
    try {
        // Save user data
        await fetch(`${SHEETS_API_URL}?operation=write&sheet=userData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(JSON.stringify(userData))}`
        });
        
        // Save news data
        await fetch(`${SHEETS_API_URL}?operation=write&sheet=newsData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(JSON.stringify(newsData))}`
        });
        
        // Save restock data
        await fetch(`${SHEETS_API_URL}?operation=write&sheet=restockData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(JSON.stringify(restockData))}`
        });
        
        // Also save to localStorage as backup
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('newsData', JSON.stringify(newsData));
        localStorage.setItem('restockData', JSON.stringify(restockData));
    } catch (error) {
        console.error('Error saving data:', error);
        // Save to localStorage as fallback
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('newsData', JSON.stringify(newsData));
        localStorage.setItem('restockData', JSON.stringify(restockData));
    }
}
```

4. Remove the `saveToJSON` function as it's no longer needed

### 4. GitHub Pages Deployment

1. Create a GitHub repository
2. Upload all the files to the repository
3. Go to Settings > Pages
4. Select the main branch as the source
5. Click Save and wait for the site to be published

## Notes

- The Google Sheets integration provides a simple database solution for GitHub Pages
- Data is still saved to localStorage as a backup in case the API is unavailable
- For a production environment, consider using a more robust backend solution