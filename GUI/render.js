const ipcRenderer = require('electron').ipcRenderer;

const uploadDir = () => {
    ipcRenderer.send('uploadDir',
                     document.querySelector('#dir').value);
}