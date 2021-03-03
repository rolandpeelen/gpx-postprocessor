const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const { readFile, writeFile } = require("fs");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: `${__dirname}/preload.js`
    }
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("openFile", async (event, args) => {
  console.log("Opening File");
  const file = await dialog.showOpenDialog({
    filters: [{ name: "GPX Files", extensions: "gpx" }],
    properties: ["openFile"]
  });
  if (!file.canceled) {
    console.log(`Reading file: ${file.filePaths[0]}`);
    readFile(file.filePaths[0], (error, data) => {
      win.webContents.send("fileOpened", data.toString());
    });
  }
});

ipcMain.on("saveFile", async (event, args) => {
  console.log("Saving File");
  const file = await dialog.showSaveDialog({
    defaultPath: "untitled.gpx"
  });
  if (!file.canceled) {
    console.log(`Saving file: ${file.filePath}`);
    writeFile(file.filePath, args, (error, data) => {
      win.webContents.send("fileSaved", null);
    });
  }
});
