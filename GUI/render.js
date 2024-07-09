const ipcRenderer = require('electron').ipcRenderer;

let isUploading = false;  // Variabile di stato per evitare chiamate multiple

function uploadDir() {
    if (isUploading) return;  // Se già in upload, esci dalla funzione
    isUploading = true;       // Imposta lo stato come in upload
    ipcRenderer.send('open-folder-dialog');
}

document.querySelector('.button').addEventListener('click', uploadDir);

ipcRenderer.on('folder-check-result', (event, result) => {
    isUploading = false;  // Reset dello stato una volta ricevuto il risultato

    if (result.success) {
        console.log('Tutti i file richiesti sono presenti nella cartella:', result.folderPath);
    } else {
        alert('I seguenti file sono mancanti nella cartella selezionata: ' + result.missingFiles.join(', '));
    }
});

//result page

