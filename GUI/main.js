const {app, BrowserWindow, ipcMain} = require('electron'); 
let win = null;

const createWindow = () => {
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false
        }
    });

    win.loadFile('index.html');
    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(createWindow);

ipcMain.on('uploadDir', (event, data) => {
    win.webContents.send('uploadedDir', data); 
});