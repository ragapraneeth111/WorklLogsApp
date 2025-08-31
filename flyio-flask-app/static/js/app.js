// app.js

/*
 * Client‑side logic for the Work Hours Logger application.
 *
 * This script manages the list of dates, displays a modal for
 * entering time entries for a specific day, persists entries in
 * localStorage and calculates the total time worked per day.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const dateListEl = document.getElementById('dateList');
  const addDateBtn = document.getElementById('addDateBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalDateTitle = document.getElementById('modalDateTitle');
  const entriesContainer = document.getElementById('entriesContainer');
  const addEntryBtn = document.getElementById('addEntryBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');

  // List of dates to display. Initially populate last 30 days.
  let dateList = generateRecentDates(30);

  // Render initial list
  renderDateList();

  // Event: Add Date
  addDateBtn.addEventListener('click', () => {
    // Prompt the user to enter a date in YYYY-MM-DD format
    const defaultDate = new Date().toISOString().slice(0, 10);
    const input = prompt('Enter a date (YYYY-MM-DD)', defaultDate);
    if (!input) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      alert('Invalid date format. Use YYYY-MM-DD.');
      return;
    }
    const dateObj = new Date(input);
    if (isNaN(dateObj.getTime())) {
      alert('Invalid date.');
      return;
    }
    const dateStr = input;
    if (!dateList.includes(dateStr)) {
      dateList.push(dateStr);
      // Sort the list descending
      dateList.sort((a, b) => (a < b ? 1 : -1));
      renderDateList();
    }
    // Open the modal immediately for the new date
    openModal(dateStr);
  });

  // Generate an array of ISO date strings for the last `n` days including today
  function generateRecentDates(n) {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }

  // Render the list of dates along with total time
  function renderDateList() {
    dateListEl.innerHTML = '';
    dateList.forEach((dateStr) => {
      const entries = getLogs(dateStr);
      const { hours, minutes } = computeTotalDuration(entries);
      // Format total time string
      const totalStr = `${hours}h ${minutes}m`;
      const dateDisplay = formatDateDisplay(dateStr);
      const li = document.createElement('li');
      li.className = 'date-item';
      li.dataset.date = dateStr;
      li.innerHTML = `<span>${dateDisplay}</span><span>${totalStr}</span>`;
      li.addEventListener('click', () => openModal(dateStr));
      dateListEl.appendChild(li);
    });
  }

  // Open the modal for a specific date
  function openModal(dateStr) {
    // Clear previous entries
    entriesContainer.innerHTML = '';
    // Set the header
    modalDateTitle.textContent = formatDateDisplay(dateStr);
    // Load entries for date
    const entries = getLogs(dateStr);
    // Render each entry row
    entries.forEach((entry) => {
      const row = createEntryRow(entry.startTime, entry.endTime, entry.description);
      entriesContainer.appendChild(row);
    });
    // If no entries, start with one empty row
    if (entries.length === 0) {
      entriesContainer.appendChild(createEntryRow());
    }
    // Show modal
    modalOverlay.classList.remove('hidden');

    // Set Add Entry button action
    addEntryBtn.onclick = () => {
      const currentRows = entriesContainer.querySelectorAll('.entry-row');
      if (currentRows.length >= 24) {
        alert('You can add up to 24 entries per day.');
        return;
      }
      entriesContainer.appendChild(createEntryRow());
    };

    // Cancel button: hide modal without saving
    cancelBtn.onclick = () => {
      modalOverlay.classList.add('hidden');
    };

    // Save button: collect entries, save to localStorage, update list
    saveBtn.onclick = () => {
      const rows = entriesContainer.querySelectorAll('.entry-row');
      const newEntries = [];
      rows.forEach((row) => {
        const startInput = row.querySelector('.start-time');
        const endInput = row.querySelector('.end-time');
        const descInput = row.querySelector('.description');
        const startVal = startInput.value;
        const endVal = endInput.value;
        const descVal = descInput.value.trim();
        // Only save if both start and end times are provided
        if (startVal && endVal) {
          newEntries.push({ startTime: startVal, endTime: endVal, description: descVal });
        }
      });
      saveLogs(dateStr, newEntries);
      renderDateList();
      modalOverlay.classList.add('hidden');
    };
  }

  // Create a row of inputs for a time entry
  function createEntryRow(startTime = '', endTime = '', description = '') {
    const row = document.createElement('div');
    row.className = 'entry-row';
    row.innerHTML = `
      <input type="text" class="start-time" placeholder="HH:MM" value="${startTime}">
      <span>to</span>
      <input type="text" class="end-time" placeholder="HH:MM" value="${endTime}">
      <input type="text" class="description" placeholder="Description" value="${description}">
      <button type="button" class="remove-btn">×</button>
    `;
    // Attach remove event
    const removeBtn = row.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      row.remove();
    });
    return row;
  }

  // Retrieve logs from localStorage
  function getLogs(dateStr) {
    const key = `logs-${dateStr}`;
    const json = localStorage.getItem(key);
    if (!json) return [];
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  // Save logs to localStorage
  function saveLogs(dateStr, entries) {
    const key = `logs-${dateStr}`;
    localStorage.setItem(key, JSON.stringify(entries));
  }

  // Compute total duration from an array of entries
  function computeTotalDuration(entries) {
    let totalMinutes = 0;
    entries.forEach(({ startTime, endTime }) => {
      if (!startTime || !endTime) return;
      const diff = diffInMinutes(startTime, endTime);
      if (diff > 0) {
        totalMinutes += diff;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }

  // Calculate difference in minutes between two time strings "HH:MM". If endTime <= startTime it assumes same day and returns 0.
  function diffInMinutes(startTime, endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    const diff = end - start;
    return diff > 0 ? diff : 0;
  }

  // Format date string to a readable format (e.g., 2025-08-30 -> Aug 30, 2025)
  function formatDateDisplay(dateStr) {
    // Parse the string into a local date without timezone offset.
    const parts = dateStr.split('-').map(Number);
    const year = parts[0];
    const month = parts[1] - 1; // zero‑indexed
    const day = parts[2];
    const date = new Date(year, month, day);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
});