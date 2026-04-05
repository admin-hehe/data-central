const SCRIPT_URL = "/api";
const API_URL = SCRIPT_URL + "?action=ambilDataBaru";
let originalData = [];
let currentPage = 1;
let rowsPerPage = 10;

const searchInput = document.getElementById('searchInput');
const rowsPerPageSelect = document.getElementById('rowsPerPageSelect');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const mobileContainer = document.getElementById('mobileContainer');
const paginationEl = document.getElementById('pagination');
const rowsSummary = document.getElementById('rowsSummary');

async function fetchData() {
  rowsSummary.textContent = "Syncing...";
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    originalData = Array.isArray(json) ? json : (json.data || []);
    originalData.reverse(); 
    
    renderTable();
  } catch (err) {
    console.error("Fetch error:", err);
    rowsSummary.textContent = "Error Connection";
    tableBody.innerHTML = `<tr><td colspan="100%" class="p-10 text-center text-red-400">Gagal mengambil data</td></tr>`;
  }
}

function esc(s) {
  return s === null || s === undefined ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getFilteredData() {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) return originalData.slice();
  return originalData.filter(row => Object.values(row).some(v => v && String(v).toLowerCase().includes(q)));
}

function renderTable() {
  const filtered = getFilteredData();
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const pageSlice = filtered.slice(startIndex, endIndex);

  // Clear
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  mobileContainer.innerHTML = "";

  if (totalItems === 0) {
    const emptyMsg = `<div class="p-10 text-center text-gray-400">Data tidak ditemukan</div>`;
    tableBody.innerHTML = `<tr><td colspan="100%">${emptyMsg}</td></tr>`;
    mobileContainer.innerHTML = emptyMsg;
    rowsSummary.textContent = "0 Baris";
    return;
  }

  const columns = Object.keys(filtered[0]);

  // Render Desktop Header
  const thRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.className = "px-6 py-4";
    th.innerHTML = esc(col);
    thRow.appendChild(th);
  });
  tableHead.appendChild(thRow);

  // Render Rows (Desktop & Mobile)
  pageSlice.forEach(row => {
    // Desktop Row
    const tr = document.createElement('tr');
    tr.className = "hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors";
    
    // Mobile Card
    const card = document.createElement('div');
    card.className = "card-item";

    columns.forEach(col => {
      const val = esc(row[col]);
      
      // Fill Desktop
      const td = document.createElement('td');
      td.className = "px-6 py-4 text-sm font-medium row-data";
      td.innerHTML = val;
      tr.appendChild(td);

      // Fill Mobile
      card.innerHTML += `
        <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
          <span class="text-[10px] uppercase font-bold text-indigo-500">${esc(col)}</span>
          <span class="text-sm font-semibold ml-5">${val}</span>
        </div>
      `;
    });
    tableBody.appendChild(tr);
    mobileContainer.appendChild(card);
  });

  rowsSummary.textContent = `${totalItems} Total Baris`;
  renderPaginationControls(totalItems, totalPages);
}

function renderPaginationControls(totalItems, totalPages) {
  paginationEl.innerHTML = `
    <div class="flex items-center justify-between">
      <button id="prevBtn" class="px-6 py-2 text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Prev</button>
      <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Hal ${currentPage} / ${totalPages}</span>
      <button id="nextBtn" class="px-6 py-2 text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Next</button>
    </div>
  `;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  prevBtn.onclick = () => { currentPage--; renderTable(); window.scrollTo(0,0); };
  nextBtn.onclick = () => { currentPage++; renderTable(); window.scrollTo(0,0); };
}

rowsPerPageSelect.addEventListener('change', (e) => {
  rowsPerPage = parseInt(e.target.value);
  currentPage = 1;
  renderTable();
});

let debounceTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { currentPage = 1; renderTable(); }, 250);
});

fetchData();
