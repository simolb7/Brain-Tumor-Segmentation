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
            webSecurity: false
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

function startPythonProcess(folderPath, event) {
    const pythonProcess = spawn('python', ['PROVA.py', folderPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        event.sender.send('process-complete');
    });
}

app.whenReady().then(() => {
    console.log("App is ready."); // Debug
    createWindow();
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

