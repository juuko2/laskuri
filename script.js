// --- 1. GLOBAALIT MUUTTUJAT ---
let player; // YouTube-soitin
const svgCanvas = document.getElementById('buildingCanvas');
const resultsBody = document.querySelector('#resultsTable tbody');

// --- 2. YOUTUBE API ASETUKSET ---
// Tämä funktio ajetaan automaattisesti, kun YouTube API on ladattu
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '200',
        width: '100%',
        videoId: 'M7lc1UVf-VE', // Oletusvideo
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Kun soitin on valmis, kytketään valikon kuuntelija
    const videoSelector = document.getElementById('videoSelector');
    videoSelector.addEventListener('change', function() {
        const videoId = this.value;
        player.loadVideoById(videoId);
    });
}

// --- 3. PÄÄFUNKTIO: Laske ja Piirrä ---
function calculateAndDraw() {
    // Haetaan arvot HTML-kentistä (DOM)
    // parseFloat muuttaa tekstin numeroksi
    const layers = parseInt(document.getElementById('layers').value);
    const floorHeight = parseFloat(document.getElementById('height').value);
    const loadPerArea = parseFloat(document.getElementById('load').value);

    // Tyhjennetään vanhat tulokset
    svgCanvas.innerHTML = ''; 
    resultsBody.innerHTML = '';

    // Määritellään SVG:n piirtoalueen skaalaus
    // Esim. skaalauskerroin jotta talo mahtuu kuvaan
    const scale = 0.1; // 1 pikseli ruudulla = 10mm todellisuudessa
    const buildingWidth = 200; // Kiinteä leveys grafiikassa
    const startX = 150; // X-koordinaatti (keskellä)
    const groundLevelY = 550; // Maanpinnan Y-koordinaatti SVG:ssä

    // --- 4. SILMUKKA (LOOP) ---
    // Käydään läpi jokainen kerros ja lasketaan/piirretään
    for (let i = 0; i < layers; i++) {
        
        // A. LASKENTA LOGIIKKA
        // Lasketaan kerroksen korkeusasema
        let currentHeightMm = (i + 1) * floorHeight;
        let currentHeightM = currentHeightMm / 1000;
        
        // Lasketaan yksinkertaistettu kuorma (esimerkki)
        // Oletetaan pinta-ala vakioksi (esim 100m2)
        let floorArea = 100; 
        let layerLoad = loadPerArea * floorArea;
        let cumulativeLoad = layerLoad * (layers - i); // Ylemmät kerrokset painavat alempia

        // B. SVG PIIRTÄMINEN (DOM Manipulaatio)
        // Luodaan suorakulmio (rect) elementti
        // SVG koordinaatisto: Y kasvaa alaspäin, joten lasketaan "alhaalta ylös"
        let rectHeight = floorHeight * scale;
        let rectY = groundLevelY - ((i + 1) * rectHeight);

        // Luodaan SVG-elementti tekstimuodossa
        // Lisätään väriä riippuen kuormasta (mitä alempi kerros, sitä tummempi)
        let colorLightness = 90 - (i * 5); 
        let rectHTML = `<rect 
            x="${startX}" 
            y="${rectY}" 
            width="${buildingWidth}" 
            height="${rectHeight}" 
            stroke="black" 
            fill="hsl(200, 70%, ${colorLightness}%)" 
        />`;
        
        // Lisätään kerrosnumero tekstinä
        let textHTML = `<text 
            x="${startX + buildingWidth + 10}" 
            y="${rectY + (rectHeight / 2)}" 
            font-size="12">
            K${i+1}
        </text>`;

        // Ruiskutetaan HTML SVG-säiliöön (+= lisää edellisten perään)
        svgCanvas.innerHTML += rectHTML + textHTML;

        // C. TULOSTEN PÄIVITYS TAULUKKOON
        // Lisätään rivi taulukkoon (käänteinen järjestys, ylin ylös)
        let row = resultsBody.insertRow(0);
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${currentHeightM.toFixed(1)}</td>
            <td>${cumulativeLoad.toFixed(1)}</td>
        `;
    }
}

// Ajetaan laskenta kerran heti sivun latautuessa, jotta sivu ei ole tyhjä
window.onload = function() {
    // Pieni viive jotta API ehtii mukaan, ei pakollinen mutta hyvä käytäntö
    setTimeout(calculateAndDraw, 500);
};