// Configuración del juego
const correctAnswers = {
    'quimico': ['gases', 'humos'],
    'seguridad': ['transito', 'alturas'],
    'fisico': ['ruido', 'vibracion'],
    'biomecanico': ['repetitivo', 'postura'],
    'biologico': ['virus', 'bacterias']
};

// Variables del estado del juego
let selectedCategory = null;
let selectedOptions = [];
let attemptCount = 0;
let correctCount = 0;
let incorrectCount = 0;

// Elementos del DOM
let categoryItems;
let optionItems;
let resultsBody;
let scoreDisplay;
let optionsContainer;

// Función para mezclar array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Función para mezclar las opciones en el DOM
function shuffleOptions() {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionElements = Array.from(optionsContainer.children);
    
    // Mezclar los elementos
    const shuffledElements = shuffleArray(optionElements);
    
    // Limpiar el contenedor
    optionsContainer.innerHTML = '';
    
    // Agregar los elementos en el nuevo orden con animación
    shuffledElements.forEach((element, index) => {
        // Agregar una pequeña animación de entrada
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        optionsContainer.appendChild(element);
        
        // Animar la entrada con un pequeño delay
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
    
    // Actualizar la referencia a los elementos de opciones
    optionItems = document.querySelectorAll('.option-item');
    setupOptionListeners();
}

// Función para configurar los event listeners de las opciones
function setupOptionListeners() {
    optionItems.forEach(item => {
        // Remover listeners anteriores clonando el elemento
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
    });
    
    // Obtener la nueva referencia después del clonado
    optionItems = document.querySelectorAll('.option-item');
    
    // Configurar nuevos event listeners
    optionItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!selectedCategory) {
                showNotification('Primero selecciona una categoría', 'incorrect');
                return;
            }

            const option = this.dataset.option;
            
            if (selectedOptions.includes(option)) {
                // Deseleccionar si ya está seleccionada
                selectedOptions = selectedOptions.filter(opt => opt !== option);
                this.classList.remove('selected');
            } else if (selectedOptions.length < 2) {
                // Seleccionar si hay menos de 2 opciones
                selectedOptions.push(option);
                this.classList.add('selected');
            } else {
                showNotification('Solo puedes seleccionar 2 opciones', 'incorrect');
            }
        });
    });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    categoryItems = document.querySelectorAll('.category-card');
    optionsContainer = document.getElementById('optionsContainer');
    resultsBody = document.getElementById('resultsBody');
    scoreDisplay = document.getElementById('scoreDisplay');

    // Mezclar las opciones al cargar la página
    shuffleOptions();

    // Configurar event listeners para categorías
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover selección anterior
            categoryItems.forEach(cat => cat.classList.remove('selected'));
            
            // Seleccionar nueva categoría
            this.classList.add('selected');
            selectedCategory = this.dataset.category;
            
            // Limpiar opciones seleccionadas
            selectedOptions = [];
            optionItems.forEach(opt => opt.classList.remove('selected'));
        });
    });

    updateScore();
    
    // Mostrar notificación de que las opciones están mezcladas
    setTimeout(() => {
        showNotification('¡Opciones mezcladas aleatoriamente! 🎲', 'correct');
    }, 500);
});

function checkAnswer() {
    if (!selectedCategory) {
        showNotification('Selecciona una categoría', 'incorrect');
        return;
    }

    if (selectedOptions.length !== 2) {
        showNotification('Selecciona exactamente 2 opciones', 'incorrect');
        return;
    }

    attemptCount++;
    const correctOptions = correctAnswers[selectedCategory];
    const isCorrect = selectedOptions.every(option => correctOptions.includes(option)) && 
                     selectedOptions.length === correctOptions.length;

    if (isCorrect) {
        correctCount++;
        showNotification('¡Correcto! 🎉', 'correct');
    } else {
        incorrectCount++;
        showNotification('Incorrecto 😞', 'incorrect');
    }

    // Agregar resultado a la tabla
    addResultToTable(isCorrect);
    
    // Actualizar puntuación
    updateScore();
    
    // Limpiar selecciones
    clearSelections();
}

function showNotification(message, type) {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function addResultToTable(isCorrect) {
    const row = document.createElement('tr');
    const currentTime = new Date().toLocaleTimeString();
    
    const categoryName = document.querySelector(`[data-category="${selectedCategory}"]`).textContent;
    const optionNames = selectedOptions.map(opt => 
        document.querySelector(`[data-option="${opt}"]`).textContent
    ).join(', ');

    row.innerHTML = `
        <td>${attemptCount}</td>
        <td>${categoryName}</td>
        <td>${optionNames}</td>
        <td class="${isCorrect ? 'status-correct' : 'status-incorrect'}">
            ${isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
        </td>
        <td>${currentTime}</td>
    `;

    resultsBody.insertBefore(row, resultsBody.firstChild);
}

function updateScore() {
    scoreDisplay.textContent = `Aciertos: ${correctCount} | Errores: ${incorrectCount}`;
}

function clearSelections() {
    selectedCategory = null;
    selectedOptions = [];
    categoryItems.forEach(item => item.classList.remove('selected'));
    optionItems.forEach(item => item.classList.remove('selected'));
}

function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los resultados.')) {
        attemptCount = 0;
        correctCount = 0;
        incorrectCount = 0;
        resultsBody.innerHTML = '';
        updateScore();
        clearSelections();
        
        // Mezclar las opciones nuevamente al reiniciar
        shuffleOptions();
        
        showNotification('Juego reiniciado - Opciones mezcladas 🎲', 'correct');
    }
}

// Función adicional para mezclar opciones manualmente (opcional)
function shuffleOptionsManually() {
    clearSelections();
    shuffleOptions();
    showNotification('¡Opciones mezcladas! 🎲', 'correct');
}