const inputNombre = document.getElementById("carName");
const boton = document.getElementById("raceButton");
const timerDisplay = document.getElementById("timer");
const raceStatus = document.getElementById("raceStatus");
const progressBar = document.getElementById("progressBar");
const tableBody = document.getElementById("tableBody");
const resultTable = document.getElementById("resultTable");

// Sonidos
const countdownSound = document.getElementById("countdownSound");
const raceEndSound = document.getElementById("raceEndSound");

const jugadoresEasyMap = [
    { nombre: "Player1", tiempo: 5.5 },
    { nombre: "Player2", tiempo: 6.2 },
    { nombre: "Player3", tiempo: 7.0 }
];

const jugadoresHardMap = [
    { nombre: "PlayerA", tiempo: 10.5 },
    { nombre: "PlayerB", tiempo: 12.0 },
    { nombre: "PlayerC", tiempo: 13.8 }
];

let clics = 0;
let carreraEnCurso = false;

// Leer el ranking desde el localStorage
function cargarRanking() {
    const rankingGuardado = localStorage.getItem('ranking');
    return rankingGuardado ? JSON.parse(rankingGuardado) : [];
}

// Guardar el ranking en el localStorage
function guardarRanking(ranking) {
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

// Actualizar la tabla del ranking en el DOM
function actualizarTablaRanking() {
    const ranking = cargarRanking(); // Cargar los resultados del localStorage
    tableBody.innerHTML = ""; // Limpiar la tabla antes de mostrar los resultados

    // Mostrar cada jugador en la tabla
    ranking.forEach((jugador, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${jugador.nombre}</td>
                <td>${jugador.tiempo.toFixed(2)}</td>
            </tr>
        `;
    });

    resultTable.style.display = "block"; // Mostrar la tabla con los resultados
}

// Mostrar el resultado de la carrera en el modal
function mostrarResultadoEnModal(vehiculoName, vehiculo, mapaNombre, clics, tiempoFinal, jugadores) {
    const modal = document.getElementById("raceModal");
    const modalMessage = document.getElementById("raceModalMessage");

    modal.style.display = "flex"; // Mostrar el modal

    modalMessage.innerHTML = `
        🏁 Carrera finalizada:<br>
        🚗 Vehículo: ${vehiculoName} (${vehiculo})<br>
        🗺️ Mapa: ${mapaNombre}<br>
        ⚡ Clics: ${clics}<br>
        ⏱️ Tiempo final: ${tiempoFinal.toFixed(2)}s<br>
        🏆 Posición: ${jugadores.findIndex(j => j.nombre === vehiculoName) + 1}
    `;

    // Al cerrar el modal
    document.getElementById("closeModal").onclick = function () {
        modal.style.display = "none";
    }
}

// Evento para iniciar la carrera
boton.addEventListener("click", (event) => {
    event.preventDefault();

    if (!carreraEnCurso) {
        const vehiculoName = inputNombre.value.trim();
        const vehiculoSeleccionado = document.querySelector('input[name="chooseCar"]:checked');
        const mapaSeleccionado = document.querySelector('input[name="chooseMap"]:checked');

        if (!vehiculoName || !vehiculoSeleccionado || !mapaSeleccionado) {
            alert("Completa todos los campos antes de comenzar la carrera.");
            return;
        }

        carreraEnCurso = true;
        clics = 1;
        boton.disabled = false;
        boton.value = "¡Haz clic rápido!";
        resultTable.style.display = "none";

        // 🎵 Sonido
        countdownSound.currentTime = 0;
        countdownSound.play();

        // 🎞️ Fondo animado
        document.body.classList.add("racing");

        // Mostrar cronómetro
        raceStatus.style.display = "block";
        timerDisplay.textContent = 10;
        progressBar.style.width = "0%";

        let timeLeft = 10;
        let interval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            progressBar.style.width = `${(100 * (10 - timeLeft)) / 10}%`;

            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        setTimeout(() => {
            carreraEnCurso = false;
            boton.disabled = true;

            const vehiculo = vehiculoSeleccionado.value;
            const mapa = mapaSeleccionado.value;

            let tiempoBase = 10;

            if (vehiculo === "mercedes") {
                tiempoBase *= 0.8;
            } else if (vehiculo === "bmw") {
                tiempoBase *= 1;
            }

            let jugadores;
            let mapaNombre = "";

            if (mapa === "hardMap") {
                tiempoBase *= 1.5;
                jugadores = [...jugadoresHardMap];
                mapaNombre = "mapa difícil";
            } else {
                tiempoBase *= 0.7;
                jugadores = [...jugadoresEasyMap];
                mapaNombre = "mapa fácil";
            }

            const bonus = Math.min(clics * 0.15, tiempoBase * 0.9);
            const tiempoFinal = tiempoBase - bonus;

            // Obtener el ranking actual
            let ranking = cargarRanking();

            // Agregar el nuevo jugador al ranking
            ranking.push({ nombre: vehiculoName, tiempo: tiempoFinal });

            // Ordenar los jugadores por tiempo
            ranking.sort((a, b) => a.tiempo - b.tiempo);

            // Guardar el ranking actualizado en el localStorage
            guardarRanking(ranking);

            // 🎵 Fin de carrera
            raceEndSound.play();
            document.body.classList.remove("racing");

            // Mostrar la tabla con el ranking actualizado
            actualizarTablaRanking();

            // Mostrar el resultado en el modal
            mostrarResultadoEnModal(vehiculoName, vehiculo, mapaNombre, clics, tiempoFinal, ranking);

            boton.value = "RACE!!!";
            boton.disabled = false;
            raceStatus.style.display = "none";
            progressBar.style.width = "0%";
        }, 10000);
    } else {
        clics++;
    }
});

// Cargar el ranking desde el localStorage al cargar la página
actualizarTablaRanking();
