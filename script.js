document.addEventListener('DOMContentLoaded', function () {
    // Configuración de Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAkvBQuwKf5Itf2wpos3VeImgTYDWf3B7A",
        authDomain: "calendario-8809d.firebaseapp.com",
        projectId: "calendario-8809d",
        storageBucket: "calendario-8809d.firebasestorage.app",
        messagingSenderId: "151836369050",
        appId: "1:151836369050:web:611b8042ee89954e603f23"
    };

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Elementos del DOM
    const calendar = document.getElementById('calendar');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const activityModal = document.getElementById('activityModal');
    const detailModal = document.getElementById('detailModal');
    const activityForm = document.getElementById('activityForm');
    const detailName = document.getElementById('detailName');
    const detailDescription = document.getElementById('detailDescription');
    const detailTime = document.getElementById('detailTime');
    const detailCompleted = document.getElementById('detailCompleted');
    const editActivityButton = document.getElementById('editActivity');
    const deleteActivityButton = document.getElementById('deleteActivity');

    let currentDate = new Date();
    let selectedDay = null;
    let selectedActivity = null;
    const activities = {};

    // ===================== FUNCIONES DEL CALENDARIO =====================
    function generateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        calendar.innerHTML = '';
        currentMonthYear.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendar.appendChild(emptyDay);
        }

        // Generar días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.innerHTML = `<h3>${i}</h3>`;
            day.addEventListener('click', () => openActivityModal(i));

            const key = `${year}-${month + 1}-${i}`;
            if (activities[key]) {
                activities[key].forEach(activity => {
                    const activityElement = document.createElement('div');
                    activityElement.classList.add('activity');
                    activityElement.innerHTML = `
                        ${activity.name} 
                        ${activity.completed === "1" ? '✅' : '⏳'}
                    `;
                    activityElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openDetailModal(activity, key);
                    });
                    day.appendChild(activityElement);
                });
            }
            calendar.appendChild(day);
        }
    }

    // ===================== FUNCIONES DE FIREBASE =====================
    async function saveActivityToFirebase(activity, key) {
        try {
            const docRef = await db.collection("calendario").add({
                ...activity,
                date: key
            });
            activity.id = docRef.id; // Guardar ID de Firebase
            return true;
        } catch (error) {
            console.error("Error guardando en Firebase:", error);
            return false;
        }
    }

    async function loadActivitiesFromFirebase() {
        try {
            const snapshot = await db.collection("calendario").get();
            snapshot.forEach(doc => {
                const activity = doc.data();
                const key = activity.date;
                activity.id = doc.id; // Añadir ID de Firebase
                
                if (!activities[key]) activities[key] = [];
                activities[key].push(activity);
            });
            generateCalendar();
        } catch (error) {
            console.error("Error cargando actividades:", error);
        }
    }

    async function updateActivityInFirebase(activity) {
        try {
            await db.collection("calendario").doc(activity.id).update({
                name: activity.name,
                description: activity.description,
                time: activity.time,
                completed: activity.completed
            });
            return true;
        } catch (error) {
            console.error("Error actualizando actividad:", error);
            return false;
        }
    }

    async function deleteActivityFromFirebase(activityId) {
        try {
            await db.collection("calendario").doc(activityId).delete();
            return true;
        } catch (error) {
            console.error("Error eliminando actividad:", error);
            return false;
        }
    }

    // ===================== MANEJO DE MODALES =====================
    function openActivityModal(day) {
        selectedDay = day;
        activityModal.style.display = 'block';
    }

    function openDetailModal(activity, key) {
        selectedActivity = { ...activity, key };
        detailName.textContent = activity.name;
        detailDescription.textContent = activity.description;
        detailTime.textContent = activity.time;
        detailCompleted.textContent = activity.completed === "1" ? "Sí" : "No";
        detailModal.style.display = 'block';
    }

    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            activityModal.style.display = 'none';
            detailModal.style.display = 'none';
        });
    });

    // ===================== MANEJO DE FORMULARIOS =====================
    activityForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const activity = {
            name: document.getElementById('activityName').value,
            description: document.getElementById('activityDescription').value,
            time: document.getElementById('activityTime').value,
            completed: document.getElementById('activityCompleted').checked ? "1" : "0"
        };

        const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`;
        const success = await saveActivityToFirebase(activity, key);
        
        if (success) {
            if (!activities[key]) activities[key] = [];
            activities[key].push(activity);
            generateCalendar();
            activityModal.style.display = 'none';
            activityForm.reset();
        }
    });

    // ===================== BOTONES DE EDICIÓN/ELIMINACIÓN =====================
    editActivityButton.addEventListener('click', async () => {
        activityModal.style.display = 'block';
        detailModal.style.display = 'none';

        // Llenar formulario con datos existentes
        document.getElementById('activityName').value = selectedActivity.name;
        document.getElementById('activityDescription').value = selectedActivity.description;
        document.getElementById('activityTime').value = selectedActivity.time;
        document.getElementById('activityCompleted').checked = selectedActivity.completed === "1";

        // Actualizar actividad al guardar
        activityForm.onsubmit = async (e) => {
            e.preventDefault();
            const updatedActivity = {
                ...selectedActivity,
                name: document.getElementById('activityName').value,
                description: document.getElementById('activityDescription').value,
                time: document.getElementById('activityTime').value,
                completed: document.getElementById('activityCompleted').checked ? "1" : "0"
            };

            const success = await updateActivityInFirebase(updatedActivity);
            if (success) {
                const index = activities[selectedActivity.key].findIndex(a => a.id === selectedActivity.id);
                activities[selectedActivity.key][index] = updatedActivity;
                generateCalendar();
                activityModal.style.display = 'none';
                activityForm.reset();
            }
        };
    });

    deleteActivityButton.addEventListener('click', async () => {
        const confirmDelete = confirm("¿Estás seguro de eliminar esta actividad?");
        if (confirmDelete) {
            const success = await deleteActivityFromFirebase(selectedActivity.id);
            if (success) {
                activities[selectedActivity.key] = activities[selectedActivity.key].filter(
                    a => a.id !== selectedActivity.id
                );
                generateCalendar();
                detailModal.style.display = 'none';
            }
        }
    });

    // ===================== NAVEGACIÓN ENTRE MESES =====================
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar();
    });

    // ===================== INICIALIZACIÓN =====================
    loadActivitiesFromFirebase();
});