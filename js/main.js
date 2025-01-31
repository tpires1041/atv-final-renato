const constraints = { video: { facingMode: "user" }, audio: false };
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultado = document.getElementById("resultado");
const listaQR = document.getElementById("lista-qr-codes");
const ctx = canvas.getContext("2d");

let db;
const dbName = "qrCodesDB";

function iniciarCamera() {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            detectarQRCode(); 
        })
        .catch(error => console.error("Erro ao acessar a câmera:", error));
}

function detectarQRCode() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
        resultado.textContent = `QR Code detectado: ${code.data}`;
        salvarQR(code.data);
    }

    requestAnimationFrame(detectarQRCode);
}

const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = event => {
    event.target.result.createObjectStore("qrCodes", { autoIncrement: true });
};

request.onsuccess = event => {
    db = event.target.result;
    carregarQRs();
};

function salvarQR(qrData) {
    const transaction = db.transaction("qrCodes", "readwrite");
    transaction.objectStore("qrCodes").add(qrData).onsuccess = carregarQRs;
}

function carregarQRs() {
    const transaction = db.transaction("qrCodes", "readonly");
    const store = transaction.objectStore("qrCodes");

    store.getAll().onsuccess = event => {
        listaQR.innerHTML = event.target.result.map(qr => `<li>${qr}</li>`).join("");
    };
}

function limparQRs() {
    const transaction = db.transaction("qrCodes", "readwrite");
    const store = transaction.objectStore("qrCodes");

    store.clear().onsuccess = () => {
        listaQR.innerHTML = '';
        resultado.textContent = 'QR Codes apagados com sucesso!';
    };
}

document.getElementById("limpar-qr-codes").addEventListener("click", limparQRs);



document.addEventListener("DOMContentLoaded", iniciarCamera);
