document.addEventListener('DOMContentLoaded', function () {
    // Configuración de Firebase (debe ser idéntica a la de calendario.html)
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
    const taskList = document.getElementById('taskList');

    // Cargar y mostrar tareas
    function loadPendingTasks() {
        db.collection("calendario")
            .where("completed", "==", "0")
            .get()
            .then((querySnapshot) => {
                const tasks = [];
                const now = new Date();

                querySnapshot.forEach((doc) => {
                    const task = doc.data();
                    const [year, month, day] = task.date.split('-');
                    const [hours, minutes] = task.time.split(':');
                    
                    // Crear objeto Date con la fecha y hora de la tarea
                    const taskDate = new Date(year, month - 1, day, hours, minutes);
                    
                    tasks.push({
                        id: doc.id,
                        ...task,
                        dateObject: taskDate,
                        formattedDate: `${day}/${month}/${year}`,
                        isExpired: taskDate < now // Agregamos un campo para saber si está vencida
                    });
                });

                // Ordenar tareas: primero las no vencidas (más cercanas primero), luego las vencidas
                tasks.sort((a, b) => {
                    if (a.isExpired === b.isExpired) {
                        // Si ambas están vencidas o no vencidas, ordenar por fecha
                        return a.dateObject - b.dateObject;
                    } else {
                        // Si una está vencida y la otra no, la no vencida va primero
                        return a.isExpired ? 1 : -1;
                    }
                });

                // Generar HTML
                taskList.innerHTML = tasks.map(task => {
                    return `
                        <div class="task-item ${task.isExpired ? 'expired' : ''}">
                            <div class="task-header">
                                <h3>${task.name} ${task.isExpired ? '<span class="expired-label">(Vencida)</span>' : ''}</h3>
                                <span>${task.formattedDate} - ${task.time}</span>
                            </div>
                            <p>${task.description}</p>
                        </div>
                    `;
                }).join('') || '<p>No hay tareas pendientes</p>';
            })
            .catch((error) => {
                console.error("Error obteniendo tareas:", error);
                taskList.innerHTML = '<p>Error al cargar las tareas</p>';
            });
    }

    // Inicialización
    loadPendingTasks();
});