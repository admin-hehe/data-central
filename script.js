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

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  mobileContainer.innerHTML = "";

  if (totalItems === 0) {
    const emptyMsg = `<div class="p-10 text-center font-black uppercase text-2xl italic">KOSONG, BRO!</div>`;
    tableBody.innerHTML = `<tr><td colspan="100%">${emptyMsg}</td></tr>`;
    mobileContainer.innerHTML = emptyMsg;
    rowsSummary.textContent = "0 ROWS";
    return;
  }

  const columns = Object.keys(filtered[0]);

  // Header Desktop
  const thRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.className = "px-6 py-4 border-r-2 border-black last:border-r-0";
    th.innerHTML = esc(col);
    thRow.appendChild(th);
  });
  tableHead.appendChild(thRow);

  // Body
  pageSlice.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-yellow-100 transition-colors";
    
    const card = document.createElement('div');
    card.className = "neo-brutal-box p-4 bg-white";

    columns.forEach(col => {
      const val = esc(row[col]);
      
      // Desktop
      const td = document.createElement('td');
      td.className = "px-6 py-4 text-base font-bold border-r-2 border-black last:border-r-0";
      td.innerHTML = val;
      tr.appendChild(td);

      // Mobile
      card.innerHTML += `
        <div class="flex flex-col mb-3 last:mb-0">
          <span class="text-[10px] uppercase font-black bg-black text-white self-start px-1 mb-1">${esc(col)}</span>
          <span class="text-lg font-bold">${val}</span>
        </div>
      `;
    });
    tableBody.appendChild(tr);
    mobileContainer.appendChild(card);
  });

  rowsSummary.textContent = `${totalItems} DATA_TOTAL`;
  renderPaginationControls(totalItems, totalPages);
}

function renderPaginationControls(totalItems, totalPages) {
  paginationEl.innerHTML = `
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <button id="prevBtn" class="neo-brutal-btn w-full md:w-auto px-8 py-3 bg-white hover:bg-lime-400 disabled:opacity-30 uppercase">← PREV</button>
      <span class="text-xl font-black italic">PAGE ${currentPage} / ${totalPages}</span>
      <button id="nextBtn" class="neo-brutal-btn w-full md:w-auto px-8 py-3 bg-white hover:bg-lime-400 disabled:opacity-30 uppercase">NEXT →</button>
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
