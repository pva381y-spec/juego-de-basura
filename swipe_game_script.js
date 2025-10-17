// --- DATOS DEL JUEGO: LISTA EXACTA DE RESIDUOS Y SUS RUTAS ---
const RESIDUOS = {
    // ------------------- ORGANICOS (IZQUIERDA) -------------------
    "assets/cascara_banana.png": ["ORGANICO", "Cáscara de Banana"],
    "assets/restos_comida.png": ["ORGANICO", "Restos de Comida"],
    "assets/servilleta_usada.png": ["ORGANICO", "Servilleta Usada"],
    "assets/filtro_cafe.png": ["ORGANICO", "Filtro de Café"],

    // ------------------ INORGANICOS (DERECHA) ------------------
    "assets/botella_plastico.png": ["INORGANICO", "Botella Plástica"],
    "assets/lata_refresco.png": ["INORGANICO", "Lata de Refresco"],
    "assets/vidrio_roto.png": ["INORGANICO", "Vidrio Roto"],
    // Nota: Eliminé 'pila_gastada' porque es un residuo especial, dejando 7 items
};

let puntuacion = 0;
let racha = 0;
let residuosDisponibles = Object.keys(RESIDUOS);
let residuoActualPath = null;
let juegoActivo = false;

// Variables para el SWIPE
let startX = 0;
let currentX = 0;
let isDragging = false;
const SWIPE_THRESHOLD = 80;

// --- REFERENCIAS DEL DOM ---
const tarjetaContenedor = document.getElementById('tarjeta-contenedor');
const residuoImagenEl = document.getElementById('residuo-imagen');
const residuoNombreEl = document.getElementById('residuo-nombre');
const puntuacionEl = document.getElementById('puntuacion');
const rachaEl = document.getElementById('racha');
const feedbackMensajeEl = document.getElementById('feedback-mensaje');
const iniciarJuegoBtn = document.getElementById('iniciar-juego');


// --- LÓGICA DE GESTO (SWIPE) ---

function getClientX(event) {
    return event.clientX || event.touches[0].clientX;
}

// Eventos de INICIO (mousedown y touchstart)
tarjetaContenedor.addEventListener('mousedown', iniciarArrastre);
tarjetaContenedor.addEventListener('touchstart', iniciarArrastre);

function iniciarArrastre(e) {
    if (!juegoActivo) return;
    
    isDragging = true;
    startX = getClientX(e);
    tarjetaContenedor.classList.add('swiping');
    
    if (e.type === 'touchstart') {
        e.preventDefault(); 
    }
}

// Eventos de MOVIMIENTO (mousemove y touchmove)
document.addEventListener('mousemove', moverTarjeta);
document.addEventListener('touchmove', moverTarjeta);

function moverTarjeta(e) {
    if (!isDragging || !juegoActivo) return;

    currentX = getClientX(e);
    const diffX = currentX - startX;
    
    tarjetaContenedor.style.transform = `translateX(${diffX}px) rotate(${diffX / 20}deg)`;
    tarjetaContenedor.style.cursor = 'grabbing';
}

// Eventos de FIN (mouseup y touchend)
document.addEventListener('mouseup', finalizarArrastre);
document.addEventListener('touchend', finalizarArrastre);

function finalizarArrastre(e) {
    if (!isDragging || !juegoActivo) return;
    
    isDragging = false;
    tarjetaContenedor.classList.remove('swiping');
    tarjetaContenedor.style.cursor = 'grab';

    const diffX = currentX - startX;
    
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        const direccion = diffX > 0 ? 'DERECHA' : 'IZQUIERDA';
        verificarGesto(direccion);
    } else {
        tarjetaContenedor.style.transform = '';
    }
}


// --- LÓGICA DEL JUEGO PRINCIPAL ---

function seleccionarResiduo() {
    if (residuosDisponibles.length === 0) {
        residuosDisponibles = Object.keys(RESIDUOS);
    }
    
    // Resetear tarjeta
    tarjetaContenedor.style.transform = '';
    tarjetaContenedor.style.opacity = 1;
    tarjetaContenedor.classList.remove('correct-swipe', 'incorrect-swipe');
    
    // Seleccionar residuo al azar
    const indice = Math.floor(Math.random() * residuosDisponibles.length);
    residuoActualPath = residuosDisponibles[indice];
    residuosDisponibles.splice(indice, 1);
    
    const [tipo, nombre] = RESIDUOS[residuoActualPath];
    
    residuoImagenEl.src = residuoActualPath;
    residuoImagenEl.alt = nombre;
    residuoNombreEl.textContent = nombre;
    feedbackMensajeEl.textContent = "¡Desliza para clasificar!";
    juegoActivo = true;
}

function verificarGesto(direccion) {
    juegoActivo = false; 

    const [tipoCorrecto, nombre] = RESIDUOS[residuoActualPath];
    
    // Regla: IZQUIERDA = ORGÁNICO; DERECHA = INORGÁNICO
    const respuestaEsperada = (tipoCorrecto === 'INORGANICO' && direccion === 'DERECHA') || 
                              (tipoCorrecto === 'ORGANICO' && direccion === 'IZQUIERDA');

    if (respuestaEsperada) {
        puntuacion += 10;
        racha++;
        tarjetaContenedor.classList.add('correct-swipe');
        feedbackMensajeEl.className = 'feedback-ok';
        feedbackMensajeEl.textContent = `✅ ¡Correcto! El ${nombre} es ${tipoCorrecto}.`;
    } else {
        racha = 0;
        tarjetaContenedor.classList.add('incorrect-swipe');
        feedbackMensajeEl.className = 'feedback-error';
        feedbackMensajeEl.textContent = `❌ ¡ERROR! El ${nombre} es ${tipoCorrecto}.`;
    }
    
    puntuacionEl.textContent = puntuacion;
    rachaEl.textContent = racha;
    
    setTimeout(seleccionarResiduo, 500);
}


function iniciarJuego() {
    puntuacion = 0;
    racha = 0;
    puntuacionEl.textContent = 0;
    rachaEl.textContent = 0;
    feedbackMensajeEl.className = '';
    
    iniciarJuegoBtn.style.display = 'none';

    residuosDisponibles = Object.keys(RESIDUOS); 
    
    seleccionarResiduo();
}


// --- INICIO AL CARGAR ---
document.addEventListener('DOMContentLoaded', () => {
    iniciarJuegoBtn.onclick = iniciarJuego;
});