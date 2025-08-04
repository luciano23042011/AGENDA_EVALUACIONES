document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const { DateTime } = luxon;
  const eventDetails = document.getElementById("eventDetails");
  const eventInfo = document.getElementById("eventInfo");

  let storedEvents = JSON.parse(localStorage.getItem("evaluaciones")) || [];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: storedEvents,
    dateClick(info) {
      const materia = prompt("Materia:");
      if (!materia) return;

      const descripcion = prompt("Descripción (opcional):");
      const activarRecordatorio = confirm("¿Deseas un recordatorio un día antes?");
      const hora = activarRecordatorio ? prompt("¿Hora del recordatorio? (HH:MM)", "08:00") : null;

      const evento = {
        title: `📘 ${materia}`,
        start: info.dateStr,
        description: descripcion,
        color: "blue"
      };

      calendar.addEvent(evento);
      storedEvents.push(evento);
      localStorage.setItem("evaluaciones", JSON.stringify(storedEvents));

      if (activarRecordatorio) {
        const fechaRecordatorio = DateTime.fromISO(info.dateStr).minus({ days: 1 }).toISODate();
        const fechaHora = `${fechaRecordatorio}T${hora}:00`;
        scheduleNotification("Recordatorio de evaluación", `Tienes evaluación de ${materia} mañana`, fechaHora);
      }
    },
    eventClick(info) {
      eventInfo.innerHTML = `<strong>${info.event.title}</strong><br>${info.event.start.toDateString()}<br>${info.event.extendedProps.description || ''}`;
      eventDetails.classList.remove("hidden");
    }
  });

  calendar.render();

  document.querySelector(".close").onclick = () => eventDetails.classList.add("hidden");

  // Modo oscuro
  const toggleBtn = document.getElementById("toggleMode");
  toggleBtn.onclick = () => {
    document.body.classList.toggle("light");
  };

  // Notificación diaria automática
  requestNotificationPermission();
  scheduleDailyReminder("¿TIENES QUE AGENDAR UNA EVALUACIÓN??", "¡No olvides registrar tus exámenes!", "08:00");

  // Test notificación
  document.getElementById("testNotification").onclick = () => {
    new Notification("🔔 Esto es una prueba", {
      body: "Así se verá tu notificación",
    });
  };

  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" });

function requestNotificationPermission() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function scheduleDailyReminder(title, message, time) {
  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (now > target) target.setDate(target.getDate() + 1);

  const delay = target - now;
  setTimeout(() => {
    new Notification(title, { body: message });
  }, delay);
}

function scheduleNotification(title, message, isoTime) {
  const time = new Date(isoTime).getTime();
  const now = Date.now();
  const delay = time - now;
  if (delay > 0) {
    setTimeout(() => {
      new Notification(title, { body: message });
    }, delay);
  }
}
