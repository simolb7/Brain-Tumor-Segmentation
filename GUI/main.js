const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

const createWindow = () => {
    console.log("Creating window..."); // Debug
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
        }
    });

    mainWindow.loadFile('index.html').then(() => {
        console.log("Window created and index.html loaded."); // Debug
    }).catch(err => console.error('Failed to load index.html:', err));

    ipcMain.on('open-folder-dialog', async (event) => {
        console.log("Opening folder dialog..."); // Debug
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                filters: [
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!result.canceled) {
                const folderPath = result.filePaths[0];
                checkRequiredFiles(folderPath, event);
            }
        } catch (error) {
            console.error('Errore durante l\'apertura della finestra di dialogo:', error);
        }
    });

    mainWindow.on('closed', () => {
        console.log("Window closed."); // Debug
        mainWindow = null;
    });

}

function checkRequiredFiles(folderPath, event) {
    const requiredSuffixes = ['-t1n.nii.gz', '-t1c.nii.gz', '-t2f.nii.gz', '-t2w.nii.gz'];
    const filesInFolder = fs.readdirSync(folderPath);

    console.log('Files in folder:', filesInFolder);
    console.log('Required suffixes:', requiredSuffixes);

    const missingFiles = requiredSuffixes.filter(suffix => {
        return !filesInFolder.some(file => file.endsWith(suffix));
    });

    console.log('Missing files:', missingFiles);

    if (missingFiles.length > 0) {
        event.sender.send('folder-check-result', {
            success: false,
            missingFiles: missingFiles
        });
    } else {
        mainWindow.loadFile('resultPage.html')
    }
}

function createResultTumorWindow() {
    let resultWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        modal: false, // Imposta a true se vuoi che sia modale
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            contentSecurityPolicy: "script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline';"
        }
    });

    resultWindow.loadFile('tumorView.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultCoreWindow() {
    let resultWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        resizable: false,
        modal: false, // Imposta a true se vuoi che sia modale
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            contentSecurityPolicy: "script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline';"
        }
    });

    resultWindow.loadFile('coreView.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultEnhancingWindow() {
    let resultWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        resizable: false,
        modal: false, // Imposta a true se vuoi che sia modale
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            contentSecurityPolicy: "script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline';"
        }
    });

    resultWindow.loadFile('enhancingView.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultNecroticWindow() {
    let resultWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        resizable: false,
        modal: false, // Imposta a true se vuoi che sia modale
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            contentSecurityPolicy: "script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline';"
        }
    });

    resultWindow.loadFile('necroticView.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}



app.whenReady().then(() => {
    console.log("App is ready."); // Debug
    createWindow();

    ipcMain.on('model-viewer-tumor', () => {
        createResultTumorWindow();
    });

    ipcMain.on('model-viewer-core', () => {
        createResultCoreWindow();
    });

    ipcMain.on('model-viewer-enhancing', () => {
        createResultEnhancingWindow();
    });

    ipcMain.on('model-viewer-necrotic', () => {
        createResultNecroticWindow();
    });

});

app.on('window-all-closed', () => {
    console.log("All windows closed."); // Debug
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    console.log("App activated."); // Debug
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

