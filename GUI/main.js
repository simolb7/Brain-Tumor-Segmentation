const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');


let mainWindow;
let cuttedWindow;
let resultWindow;
let t2Path;

//create the main window 1200x800
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

    //indicizza la pagina a index.html
    mainWindow.loadFile('index.html').then(() => {
        console.log("Window created and index.html loaded."); // Debug
    }).catch(err => console.error('Failed to load index.html:', err));

    //apre una finestra di dialogo di sistema per prendere la directory
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
    //controlla se ci sono tutti i file richiesti nella directory
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

        const t1w = filesInFolder.find(file => file.endsWith('-t1n.nii.gz'));
        const t1ce = filesInFolder.find(file => file.endsWith('-t1c.nii.gz'));
        const flair = filesInFolder.find(file => file.endsWith('-t2f.nii.gz'));
        const t2 = filesInFolder.find(file => file.endsWith('-t2w.nii.gz'));
        
        const t1wPath = path.join(folderPath, t1w);
        const t1cePath = path.join(folderPath, t1ce);
        const flairPath = path.join(folderPath, flair);
        t2Path = path.join(folderPath, t2);

        console.log(`t2: ${t2Path}`);
        console.log(`flair: ${flairPath}`);
        console.log(`t1ce: ${t1cePath}`);

        mainWindow.loadFile('loading.html').then(() => {
            // Inizia il processo Python
            const pythonProcess = spawn('python', ['../main.py', t2Path, flairPath, t1cePath]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            console.log("Python process started.");
            pythonProcess.on('close', (code) => {
                console.log(`Process finished with code ${code}`);
                // Una volta terminato il processo Python, carica la pagina dei risultati
                mainWindow.loadFile('resultPage.html');
            });
        }).catch(err => console.error('Failed to load loading.html:', err));
    }
}

//creo una finestra apposita per ogni schermata possibile in base alla funzione
function createResultTumorWindow() {
    resultWindow = new BrowserWindow({
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

    resultWindow.loadFile('loading.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultCoreWindow() {
    resultWindow = new BrowserWindow({
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

    resultWindow.loadFile('loading.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultEnhancingWindow() {
    resultWindow = new BrowserWindow({
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

    resultWindow.loadFile('loading.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultNecroticWindow() {
    resultWindow = new BrowserWindow({
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

    resultWindow.loadFile('loading.html');

    resultWindow.on('closed', () => {
        resultWindow = null;
    });
}

function createResultCuttedWindow() {
    cuttedWindow = new BrowserWindow({
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

    cuttedWindow.loadFile('loading.html');

    cuttedWindow.on('closed', () => {
        cuttedWindow = null;
    });
}




app.whenReady().then(() => {
    console.log("App is ready."); // Debug
    createWindow();

    ipcMain.on('model-viewer-tumor', () => {
        //lancia la funzione per creare la finestra ed intanto lancia il processo python per la creazione del modello 3d
        createResultTumorWindow();

        console.log(`Script Path: `);
    
        // Esegui il processo Python 
        const pythonProcess = spawn('python', ['../model_3d/tumor.py']);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            // Invia un messaggio al renderer per aggiornare l'interfaccia utente
            resultWindow.loadFile('tumorView.html');
        });
    });

    ipcMain.on('model-viewer-core', () => {
        createResultCoreWindow();
        console.log(`Script Path: `);
    
        // Esegui il processo Python 
        const classTumor = 1;
        const pythonProcess = spawn('python', ['../model_3d/tumor_classes.py', classTumor]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            // Invia un messaggio al renderer per aggiornare l'interfaccia utente
            resultWindow.loadFile('coreView.html');
        });
    });

    ipcMain.on('model-viewer-enhancing', () => {
        createResultEnhancingWindow();

        console.log(`Script Path: `);
    
        // Esegui il processo Python 
        const classTumor = 2;
        const pythonProcess = spawn('python', ['../model_3d/tumor_classes.py', classTumor]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            // Invia un messaggio al renderer per aggiornare l'interfaccia utente
            resultWindow.loadFile('enhancingView.html');
        });
    });

    ipcMain.on('model-viewer-necrotic', () => {
        createResultNecroticWindow();
        console.log(`Script Path: `);
    
        // Esegui il processo Python 
        const classTumor = 3;
        const pythonProcess = spawn('python', ['../model_3d/tumor_classes.py', classTumor]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            // Invia un messaggio al renderer per aggiornare l'interfaccia utente
            resultWindow.loadFile('necroticView.html');
        });
    });

    ipcMain.on('model-viewer-cutted', (event, data) => {
        createResultCuttedWindow();
    
        const { axis, value } = data;
    
        console.log(`Axis: ${axis}, Value: ${value}`);
        // Verifica il percorso assoluto del file Python
        const scriptPath = path.join(__dirname, '../model_3d/cutModel.py');
        console.log(`Script Path: ${scriptPath}`);
    
        // Esegui il processo Python 
        const pythonProcess = spawn('python', [scriptPath, t2Path, axis, value]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            // Invia un messaggio al renderer per aggiornare l'interfaccia utente
            cuttedWindow.loadFile('cuttedView.html').then(() => {
                // Dopo che la pagina è stata caricata, invia i dati

                console.log(`Axis: ${axis}, Value: ${value}`);
                cuttedWindow.webContents.send('update-view', { axis, value });
            });
        });
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

