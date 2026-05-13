// Public page JS (Homepage + Inventory grid)

const LS = {
  inventory: 'balasan_moto_db',
};

const initialUnits = [
  { id: 1, name: 'Sidlak 125i', price: '₱75,000', dp: '₱3,500', status: 'Available' },
  { id: 2, name: 'Harabas 150', price: '₱82,000', dp: '₱5,000', status: 'Available' },
  { id: 3, name: 'Alon 160 ABS', price: '₱125,000', dp: '₱8,000', status: 'Available' },
  { id: 4, name: 'Banyos 110', price: '₱55,000', dp: '₱2,500', status: 'Available' },
  { id: 5, name: 'Kusog 200', price: '₱140,000', dp: '₱12,000', status: 'Available' },
  { id: 6, name: 'Layag 150', price: '₱95,000', dp: '₱6,500', status: 'Available' },
  { id: 7, name: 'Hiraya 125', price: '₱68,000', dp: '₱4,000', status: 'Available' }
];

function initLocalStorage() {
  if (!localStorage.getItem(LS.inventory)) {
    localStorage.setItem(LS.inventory, JSON.stringify(initialUnits));
  }
}

function getInventory() {
  return JSON.parse(localStorage.getItem(LS.inventory) || '[]');
}

function renderHomeGrid() {
  const grid = document.getElementById('customer-grid');
  if (!grid) return;

  const inv = getInventory();
  const available = inv.filter((u) => u.status === 'Available');

  grid.innerHTML = '';
  if (available.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center text-sm text-gray-500 py-10">No available units right now.</div>';
    return;
  }

  available.forEach((u) => {
    grid.innerHTML += `
      <div class="bg-white rounded-2xl shadow hover:shadow-xl transition p-5 border border-gray-100 flex flex-col">
        <div class="h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-300">
          <i class="fas fa-motorcycle fa-3x"></i>
        </div>
        <h3 class="font-black text-blue-950 text-lg uppercase tracking-tighter">${u.name}</h3>
        <p class="text-xs text-gray-400 font-bold mb-4 uppercase">DP: ${u.dp}</p>
        <div class="mt-auto">
          <p class="text-sm font-black text-orange-600 mb-4">${u.price}</p>
          <a href="#contact" class="w-full bg-blue-950 text-white py-2 rounded-lg font-bold text-xs hover:bg-orange-500 transition block text-center">INQUIRE UNIT</a>
        </div>
      </div>
    `;
  });
}


function initPublic() {
  initLocalStorage();
  renderHomeGrid();
}

window.addEventListener('DOMContentLoaded', initPublic);

