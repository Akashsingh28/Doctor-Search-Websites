// Doctor dataset (can later be sourced from backend)
const doctors = [
  { id: 1, name: "Dr. Anil Sharma", city: "Delhi", specialization: "Cardiologist", hospital: "Heart Care Center" },
  { id: 2, name: "Dr. Meera Nair", city: "Mumbai", specialization: "Dermatologist", hospital: "Skin Glow Clinic" },
  { id: 3, name: "Dr. Kavita Rao", city: "Bengaluru", specialization: "Pediatrician", hospital: "Child Health Hub" },
  { id: 4, name: "Dr. Rohan Gupta", city: "Chennai", specialization: "Neurologist", hospital: "NeuroCare Institute" },
  { id: 5, name: "Dr. Farhan Ali", city: "Hyderabad", specialization: "Orthopedic", hospital: "Bone & Joint Center" },
  { id: 6, name: "Dr. Sneha Patel", city: "Ahmedabad", specialization: "Gynecologist", hospital: "Women's Wellness Clinic" },
  { id: 7, name: "Dr. Vikram Singh", city: "Delhi", specialization: "ENT", hospital: "City ENT Hospital" },
  { id: 8, name: "Dr. Priya Menon", city: "Kochi", specialization: "Oncologist", hospital: "LifeCare Oncology" },
  { id: 9, name: "Dr. Arjun Desai", city: "Pune", specialization: "General Physician", hospital: "Family Health Center" },
  { id: 10, name: "Dr. Neha Kapoor", city: "Jaipur", specialization: "Cardiologist", hospital: "Advanced Heart Clinic" }
];

const modeSelect = document.getElementById('modeSelect');
const queryInput = document.getElementById('queryInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const emptyState = document.getElementById('emptyState');

const modal = document.getElementById('appointmentModal');
const closeModalBtn = modal?.querySelector('button.close');
const appointmentForm = document.getElementById('appointmentForm');
const doctorIdField = document.getElementById('doctorIdField');
const selectedDoctorInfo = document.getElementById('selectedDoctorInfo');
const statusMsg = document.getElementById('statusMsg');
const patientName = document.getElementById('patientName');
const patientEmail = document.getElementById('patientEmail');
const apptDate = document.getElementById('apptDate');
const apptTime = document.getElementById('apptTime');
const reason = document.getElementById('reason');

function renderResults(list) {
  resultsDiv.innerHTML = '';
  emptyState.textContent = '';
  if (!list.length) {
    emptyState.textContent = 'No results found for the selected mode.';
    return;
  }
  list.forEach(d => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <h4>${d.name}</h4>
      <div><strong>City:</strong> ${d.city}</div>
      <div><strong>Specialization:</strong> ${d.specialization}</div>
      <div><strong>Hospital:</strong> ${d.hospital}</div>
      <button data-id="${d.id}">Book</button>
    `;
    card.querySelector('button').addEventListener('click', () => openAppointment(d));
    resultsDiv.appendChild(card);
  });
}

function search() {
  const mode = modeSelect.value; // 'city' | 'name' | 'specialization'
  const term = queryInput.value.trim().toLowerCase();
  if (!term) {
    renderResults([]);
    return;
  }
  const filtered = doctors.filter(d => {
    if (mode === 'city') return d.city.toLowerCase().includes(term);
    if (mode === 'name') return d.name.toLowerCase().includes(term);
    if (mode === 'specialization') return d.specialization.toLowerCase().includes(term);
    return false;
  });
  renderResults(filtered);
}

function clearSearch() {
  queryInput.value = '';
  renderResults([]);
}

function openAppointment(doctor) {
  doctorIdField.value = doctor.id;
  selectedDoctorInfo.innerHTML = `
    <strong>${doctor.name}</strong><br>
    ${doctor.specialization} - ${doctor.city}<br>
    ${doctor.hospital}
  `;
  statusMsg.textContent = '';
  appointmentForm.reset();
  // preserve hidden field and info
  doctorIdField.value = doctor.id;
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

searchBtn?.addEventListener('click', search);
queryInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); search(); } });
clearBtn?.addEventListener('click', clearSearch);
closeModalBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

appointmentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusMsg.textContent = 'Saving...';
  const payload = {
    doctorId: Number(doctorIdField.value),
    patientName: patientName.value.trim(),
    patientEmail: patientEmail.value.trim() || null,
    appointmentDate: `${apptDate.value} ${apptTime.value}`,
    reason: reason.value.trim() || null
  };
  if (!payload.doctorId || !payload.patientName || !apptDate.value || !apptTime.value) {
    statusMsg.textContent = 'Please fill required fields.';
    statusMsg.style.color = 'red';
    return;
  }
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      statusMsg.textContent = data.error || 'Error saving appointment.';
      statusMsg.style.color = 'red';
      return;
    }
    statusMsg.textContent = 'Appointment booked successfully (ID: ' + data.id + ')';
    statusMsg.style.color = 'green';
    setTimeout(closeModal, 1400);
  } catch (err) {
    statusMsg.textContent = 'Network error.';
    statusMsg.style.color = 'red';
  }
});

// Initial state
renderResults([]);
