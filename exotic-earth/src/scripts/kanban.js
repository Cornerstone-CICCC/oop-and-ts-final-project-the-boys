const PRIORITY_CONFIG = {
  high: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    label: "High Priority",
  },
  medium: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
    label: "Medium",
  },
  low: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    label: "Low",
  },
};

// =====================
// Search Index
// =====================
let searchIndex = [];
function refreshSearchIndex() {
  searchIndex = [...document.querySelectorAll("[data-task-id]")].map(card => ({
    id: card.dataset.taskId,
    title: card.querySelector("h4")?.textContent?.trim() || "",
    description: card.querySelector("p")?.textContent?.trim() || "",
    priority: card.dataset.taskPriority || "medium",
    element: card,
  }));
}

// =====================
// Card HTML builder
// =====================
function createCardHTML(id, title, description, priority, isDone) {
  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  const badgeHTML = isDone
    ? `<span class="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Completed</span>`
    : `<span class="${p.bg} ${p.text} text-[10px] uppercase font-bold px-2 py-0.5 rounded">${p.label}</span>`;

  const iconHTML = isDone
    ? `<span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>`
    : `<span class="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-lg">drag_indicator</span>`;

  const titleClass = isDone ? "font-bold text-sm mb-1 line-through text-slate-400" : "font-bold text-sm mb-1";
  const descClass = isDone
    ? "text-xs leading-relaxed mb-4 text-slate-400 dark:text-slate-500"
    : "text-xs leading-relaxed mb-4 text-slate-500 dark:text-slate-400";

  const cardClass = isDone
    ? "task-card bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all group opacity-75 grayscale-[0.2]"
    : "task-card bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all group hover:shadow-md hover:border-primary/30 cursor-grab active:cursor-grabbing";

  return `
    <div class="${cardClass}" draggable="${!isDone}" data-task-id="${id}" data-task-priority="${priority}">
      <div class="flex justify-between items-start mb-2">
        ${badgeHTML}
        ${iconHTML}
      </div>
      <h4 class="${titleClass}">${title}</h4>
      <p class="${descClass}">${description}</p>
      <div class="flex items-center justify-between">
        <div class="flex -space-x-2"></div>
        <div class="flex items-center gap-2 text-[10px] font-medium ${isDone ? 'text-green-500 font-bold' : 'text-slate-400'}">
          ${isDone ? '<span class="material-symbols-outlined text-sm">task_alt</span> Verified' : ''}
        </div>
      </div>
    </div>
  `;
}

// =====================
// Apply done / undone styling to existing cards
// =====================
function applyDoneStyle(card) {
  const priority = card.dataset.taskPriority || "medium";

  const title = card.querySelector("h4")?.textContent?.trim() || "";
  const desc = card.querySelector("p")?.textContent?.trim() || "";

  const tmp = document.createElement("div");
  tmp.innerHTML = createCardHTML(card.dataset.taskId, title, desc, priority, true);
  const newCard = tmp.firstElementChild;

  card.replaceWith(newCard);
  attachDragEvents(newCard);
  refreshSearchIndex();
}

function removeDoneStyle(card) {
  const priority = card.dataset.taskPriority || "medium";
  const title = card.querySelector("h4")?.textContent?.trim() || "";
  const desc = card.querySelector("p")?.textContent?.trim() || "";

  const tmp = document.createElement("div");
  tmp.innerHTML = createCardHTML(card.dataset.taskId, title, desc, priority, false);
  const newCard = tmp.firstElementChild;

  card.replaceWith(newCard);
  attachDragEvents(newCard);
  refreshSearchIndex();
}

// =====================
// Drag & Drop
// =====================
let draggingColumn = null;

function getAllDropZones() {
  return document.querySelectorAll("[data-drop-zone]");
}

// Invisible 1x1 image to hide native drag ghost
const emptyImg = new Image();
emptyImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

let dragClone = null;
let dragSourceCard = null;

// Track cursor via document-level dragover (always has correct coordinates)
document.addEventListener("dragover", (e) => {
  if (!dragClone) return;
  dragClone.style.left = (e.clientX - dragClone.offsetWidth / 2) + "px";
  dragClone.style.top = (e.clientY - 20) + "px";
});

function attachDragEvents(card) {
  if (card.getAttribute("draggable") === "false") return;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", card.dataset.taskId);
    e.dataTransfer.effectAllowed = "move";

    // Hide native ghost
    e.dataTransfer.setDragImage(emptyImg, 0, 0);

    dragSourceCard = card;

    // Create solid floating clone
    dragClone = card.cloneNode(true);
    dragClone.style.position = "fixed";
    dragClone.style.width = card.offsetWidth + "px";
    dragClone.style.opacity = "1";
    dragClone.style.pointerEvents = "none";
    dragClone.style.zIndex = "9999";
    dragClone.style.transform = "rotate(2deg) scale(1.02)";
    dragClone.style.transition = "none";
    dragClone.classList.add("ring-2", "ring-primary", "shadow-lg", "shadow-primary/20");
    document.body.appendChild(dragClone);

    // Initial position
    dragClone.style.left = (e.clientX - card.offsetWidth / 2) + "px";
    dragClone.style.top = (e.clientY - 20) + "px";

    card.classList.add("opacity-30");
  });

  card.addEventListener("dragend", () => {
    if (dragSourceCard) {
      dragSourceCard.classList.remove("opacity-30");
      dragSourceCard = null;
    }
    if (dragClone) {
      dragClone.remove();
      dragClone = null;
    }
    getAllDropZones().forEach((zone) => zone.classList.remove("drop-highlight"));
  });
}

function registerDropZone(zone) {
  zone.addEventListener("dragover", (e) => {
    if (draggingColumn) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    zone.classList.add("drop-highlight");
  });

  zone.addEventListener("dragleave", (e) => {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove("drop-highlight");
    }
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drop-highlight");
    if (draggingColumn) return;
    const taskId = e.dataTransfer.getData("text/plain");
    const draggedCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!draggedCard) return;

    const addBtn = zone.querySelector(".add-task-btn");
    if (addBtn) {
      zone.insertBefore(draggedCard, addBtn);
    } else {
      zone.appendChild(draggedCard);
    }

    const column = zone.closest("[data-column-id]");
    const targetStatus = column?.dataset.columnStatus;

    if (targetStatus === "done") {
      applyDoneStyle(draggedCard);
    } else {
      const wasDone = draggedCard.querySelector(".material-symbols-outlined")?.textContent?.trim() === "check_circle";
      if (wasDone) {
        removeDoneStyle(draggedCard);
      }
    }

    updateColumnCounts();
  });
}

// Attach to all existing cards
document.querySelectorAll("[data-task-id]").forEach(attachDragEvents);

// Register all existing drop zones
getAllDropZones().forEach(registerDropZone);

function updateColumnCounts() {
  document.querySelectorAll("[data-column-id]").forEach((col) => {
    const zone = col.querySelector("[data-drop-zone]");
    const badge = col.querySelector("h3 + span");
    if (zone && badge) {
      const count = zone.querySelectorAll("[data-task-id]").length;
      badge.textContent = String(count);
    }
  });
}

// =====================
// Add Column
// =====================
const addColumnBtn = document.getElementById("add-column-btn");
const kanbanBoard = document.getElementById("kanban-board");

if (addColumnBtn && kanbanBoard) {
  addColumnBtn.addEventListener("click", () => {
    // Replace button content with an input
    const originalHTML = addColumnBtn.innerHTML;
    addColumnBtn.innerHTML = `
      <input
        type="text"
        placeholder="Column name..."
        class="bg-transparent border-b-2 border-primary text-center text-sm font-bold text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400 w-48 py-1"
        autofocus
      />
    `;
    const input = addColumnBtn.querySelector("input");
    input.focus();

    function restoreButton() {
      addColumnBtn.innerHTML = originalHTML;
    }

    function createColumn() {
      const title = input.value.trim();
      if (!title) {
        restoreButton();
        return;
      }

      // Slugify the title for a unique id
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const columnId = slug || "column-" + Date.now();

      // Prevent duplicate column ids
      if (document.querySelector(`[data-column-id="${columnId}"]`)) {
        restoreButton();
        return;
      }

      // Build column HTML matching KanbanColumn.astro structure
      const columnEl = document.createElement("div");
      columnEl.className = "w-80 flex flex-col gap-4 shrink-0";
      columnEl.setAttribute("data-column-id", columnId);
      columnEl.setAttribute("data-column-status", columnId);
      columnEl.innerHTML = `
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-slate-700 dark:text-slate-300">${title}</h3>
            <span class="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">0</span>
          </div>
          <button class="text-slate-400 hover:text-primary transition-colors column-menu-btn">
            <span class="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
        <div
          class="kanban-column flex flex-col gap-3 custom-scrollbar overflow-y-auto pr-1"
          data-drop-zone="${columnId}"
        ></div>
      `;

      // Insert before the add-column placeholder
      kanbanBoard.insertBefore(columnEl, addColumnBtn);

      // Register drag-and-drop on the new drop zone
      const newZone = columnEl.querySelector("[data-drop-zone]");
      registerDropZone(newZone);

      restoreButton();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        createColumn();
      } else if (e.key === "Escape") {
        e.preventDefault();
        restoreButton();
      }
    });

    input.addEventListener("blur", () => {
      createColumn();
    });
  });
}

// =====================
// Column Reordering
// =====================
function setupColumnDrag(column) {
  const header = column.querySelector(".flex.items-center.justify-between.px-2");
  if (!header) return;

  header.setAttribute("draggable", "true");
  header.style.cursor = "grab";

  header.addEventListener("dragstart", (e) => {
    e.stopPropagation();
    draggingColumn = column;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/x-column", column.dataset.columnId);
    requestAnimationFrame(() => {
      column.classList.add("column-dragging");
    });
  });

  header.addEventListener("dragend", () => {
    column.classList.remove("column-dragging");
    draggingColumn = null;
    removeDropIndicator();
  });
}

// Set up drag on all existing columns
document.querySelectorAll("[data-column-id]").forEach(setupColumnDrag);

// Indicator helpers
let dropIndicator = null;

function removeDropIndicator() {
  if (dropIndicator && dropIndicator.parentNode) {
    dropIndicator.parentNode.removeChild(dropIndicator);
  }
  dropIndicator = null;
}

function showDropIndicator(referenceEl, before) {
  removeDropIndicator();
  dropIndicator = document.createElement("div");
  dropIndicator.className = "column-drop-indicator";
  if (before) {
    referenceEl.parentNode.insertBefore(dropIndicator, referenceEl);
  } else {
    referenceEl.parentNode.insertBefore(dropIndicator, referenceEl.nextSibling);
  }
}

// Board-level drag listeners for column reorder
if (kanbanBoard) {
  kanbanBoard.addEventListener("dragover", (e) => {
    if (!draggingColumn) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const columns = [...kanbanBoard.querySelectorAll("[data-column-id]")].filter(
      (c) => c !== draggingColumn
    );
    if (columns.length === 0) {
      removeDropIndicator();
      return;
    }

    let closest = null;
    let closestDist = Infinity;
    let insertBefore = true;

    for (const col of columns) {
      const rect = col.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - midX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = col;
        insertBefore = e.clientX < midX;
      }
    }

    if (closest) {
      showDropIndicator(closest, insertBefore);
    }
  });

  kanbanBoard.addEventListener("drop", (e) => {
    if (!draggingColumn) return;
    e.preventDefault();
    removeDropIndicator();

    const columns = [...kanbanBoard.querySelectorAll("[data-column-id]")].filter(
      (c) => c !== draggingColumn
    );

    let closest = null;
    let insertBefore = true;

    let closestDist = Infinity;
    for (const col of columns) {
      const rect = col.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - midX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = col;
        insertBefore = e.clientX < midX;
      }
    }

    if (closest) {
      if (insertBefore) {
        kanbanBoard.insertBefore(draggingColumn, closest);
      } else {
        kanbanBoard.insertBefore(draggingColumn, closest.nextSibling);
      }
    }

    // Always keep #add-column-btn last
    const addBtn = document.getElementById("add-column-btn");
    if (addBtn) {
      kanbanBoard.appendChild(addBtn);
    }

    draggingColumn.classList.remove("column-dragging");
    draggingColumn = null;
  });

  kanbanBoard.addEventListener("dragleave", (e) => {
    if (!draggingColumn) return;
    if (!kanbanBoard.contains(e.relatedTarget)) {
      removeDropIndicator();
    }
  });
}

// Auto-setup column drag on dynamically added columns
if (kanbanBoard) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.hasAttribute("data-column-id")) {
          setupColumnDrag(node);
        }
      }
    }
  });
  observer.observe(kanbanBoard, { childList: true });
}

// =====================
// Sync status select with current columns
// =====================
function syncStatusSelect() {
  const select = document.getElementById('task-status-select');
  if (!select) return;

  const columns = document.querySelectorAll('[data-column-id]');
  const currentValue = select.value;

  select.innerHTML = '';
  columns.forEach(col => {
    const status = col.dataset.columnStatus;
    const title = col.querySelector('h3')?.textContent?.trim() || status;
    const option = document.createElement('option');
    option.value = status;
    option.textContent = title;
    select.appendChild(option);
  });

  // Restore previous selection if it still exists
  if ([...select.options].some(o => o.value === currentValue)) {
    select.value = currentValue;
  }
}

// ADD TASK MODAL:

// Navbar "Add Task" button — opens modal with first column selected
document.querySelector('.add-task-btn-nav')?.addEventListener('click', () => {
  const modal = document.getElementById('task-modal');
  const select = document.getElementById('task-status-select');
  if (modal && select) {
    document.getElementById('task-form').reset();
    editingCard = null;
    syncStatusSelect();
    modal.showModal();
  }
});

document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.add-task-btn');
  if (!addBtn) return;

  const status = addBtn.dataset.columnStatus;
  const modal = document.getElementById('task-modal');
  const select = document.getElementById('task-status-select');

  if (modal && select) {
    document.getElementById('task-form').reset();
    editingCard = null;
    syncStatusSelect();
    select.value = status;
    modal.showModal();
  }
});

document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('border-primary', 'text-primary'));
    btn.classList.add('border-primary', 'text-primary');
    document.getElementById('task-priority-input').value = btn.dataset.priority;
  });
});

document.getElementById('task-form')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title-input').value;
  const desc = document.getElementById('task-desc-input').value;
  const status = document.getElementById('task-status-select').value;
  const priority = document.getElementById('task-priority-input').value;
  const id = "task-" + Date.now();

  const cardHTML = createCardHTML(id, title, desc, priority, status === 'done');
  
  const dropZone = document.querySelector(`[data-drop-zone="${status}"]`);
  
  if (dropZone) {
    const tmp = document.createElement('div');
    tmp.innerHTML = cardHTML;
    const newCard = tmp.firstElementChild;
    
    const addBtn = dropZone.querySelector('.add-task-btn');
    dropZone.insertBefore(newCard, addBtn);
    
    attachDragEvents(newCard);
    updateColumnCounts();
    refreshSearchIndex();
  }

  document.getElementById('task-modal').close();
});


// VIEW MODAL:

function openViewModal(card) {
    const modal = document.getElementById('view-task-modal');
    if (!modal) return;

    const title = card.querySelector('h4')?.textContent || "";
    const desc = card.querySelector('p')?.textContent || "";
    const priority = card.dataset.taskPriority || "medium";
    const taskId = card.dataset.taskId || "";

    document.getElementById('view-title').textContent = title;
    document.getElementById('view-desc').textContent = desc;

    const idDisplay = document.getElementById('view-task-id-text');
    if (idDisplay) idDisplay.textContent = taskId;

    const modalPriority = document.getElementById('view-priority');
    const pConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    modalPriority.className = `text-xs font-bold ${pConfig.text.replace('dark:', '')} flex items-center gap-1`;
    modalPriority.innerHTML = `<span class="material-symbols-outlined text-sm">priority_high</span> ${pConfig.label}`;

    const column = card.closest('[data-column-status]');
    const status = column ? column.dataset.columnStatus : 'todo';
    const modalStatus = document.getElementById('view-status');
    if (modalStatus) {
        modalStatus.textContent = `● ${status.replace('-', ' ').toUpperCase()}`;
        modalStatus.className = (status === 'done')
            ? "text-xs font-bold text-green-500 italic"
            : "text-xs font-bold text-primary italic";
    }

    modal.showModal();
}

document.addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (!card || e.target.closest('button')) return;
    openViewModal(card);
});

// BUTTON MARK AS COMPLETE:

document.getElementById('btn-mark-complete')?.addEventListener('click', () => {
  const taskId = document.getElementById('view-task-id-text')?.textContent.trim();

  const card = document.querySelector(`[data-task-id="${taskId}"]`);

  const doneColumnZone = document.querySelector('[data-column-status="done"] [data-drop-zone]');
  if (card && doneColumnZone) {
    const addBtn = doneColumnZone.querySelector('.add-task-btn');
    if (addBtn) {
      doneColumnZone.insertBefore(card, addBtn);
    } else {
      doneColumnZone.appendChild(card);
    }

    applyDoneStyle(card);

    updateColumnCounts();

    document.getElementById('view-task-modal').close();
  } else {
    console.error("Error!");
    }
  });

// EDIT TASK MODAL:

let editingCard = null;

document.addEventListener('click', (e) => {
  const editBtn = e.target.closest('#btn-edit-task');
  
  if (editBtn) {
    const viewModal = document.getElementById('view-task-modal');
    const editModal = document.getElementById('task-modal');

    const title = document.getElementById('view-title')?.textContent.trim();
    const desc = document.getElementById('view-desc')?.textContent.trim();
    const taskId = document.getElementById('view-task-id-text')?.textContent.trim();

    editingCard = document.querySelector(`[data-task-id="${taskId}"]`);

    if (editingCard && editModal) {
      document.getElementById('task-title-input').value = title;
      document.getElementById('task-desc-input').value = desc;

      syncStatusSelect();
      const currentColumn = editingCard.closest('[data-column-status]');
      const statusSelect = document.getElementById('task-status-select');
      if (statusSelect && currentColumn) {
        statusSelect.value = currentColumn.dataset.columnStatus;
      }

      const priority = editingCard.dataset.taskPriority;
      document.getElementById('task-priority-input').value = priority;
      document.querySelectorAll('.priority-btn').forEach(btn => {
          btn.classList.toggle('border-primary', btn.dataset.priority === priority);
          btn.classList.toggle('text-primary', btn.dataset.priority === priority);
      });

      viewModal.close();
      editModal.showModal();
    }
  }
});

document.getElementById('task-form')?.addEventListener('submit', (e) => {
  if (editingCard) {
    e.preventDefault();
    
    const title = document.getElementById('task-title-input').value;
    const desc = document.getElementById('task-desc-input').value;
    const status = document.getElementById('task-status-select').value;
    const priority = document.getElementById('task-priority-input').value;
    const id = editingCard.dataset.taskId;

    const isDone = status === 'done';
    const tmp = document.createElement('div');
    tmp.innerHTML = createCardHTML(id, title, desc, priority, isDone);
    const newCard = tmp.firstElementChild;

    const targetZone = document.querySelector(`[data-drop-zone="${status}"]`);
    editingCard.replaceWith(newCard);
    if (targetZone) {
      const addBtn = targetZone.querySelector('.add-task-btn');
      targetZone.insertBefore(newCard, addBtn);
    }
    
    attachDragEvents(newCard);
    updateColumnCounts();
    refreshSearchIndex();
    document.getElementById('task-modal').close();
    editingCard = null;
    }
});

// DELETE BUTTON MODAL:

let cardToDelete = null;

document.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('#btn-delete-task');
  if (!deleteBtn) return;

  const viewModal = document.getElementById('view-task-modal');
  const deleteModal = document.getElementById('delete-confirmation-modal');
  
  const taskTitle = document.getElementById('view-title').textContent;
  const taskId = document.getElementById('view-task-id-text').textContent.trim();

  cardToDelete = document.querySelector(`[data-task-id="${taskId}"]`);

  if (deleteModal) {
    const nameDisplay = document.getElementById('delete-task-name');
    if (nameDisplay) nameDisplay.textContent = `"${taskTitle}"`;
    
    viewModal.close();
    deleteModal.showModal();
  }
});

document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
  if (cardToDelete) {
    cardToDelete.remove();
    updateColumnCounts();
    refreshSearchIndex();

    document.getElementById('delete-confirmation-modal').close();
    cardToDelete = null;
  }
});

// =====================
// Search Auto-completion
// =====================
const searchInput = document.getElementById('search-input');
const searchDropdown = document.getElementById('search-dropdown');
const searchContainer = document.getElementById('search-container');

// Build initial index once all cards are in the DOM
refreshSearchIndex();

function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<strong class="text-primary">$1</strong>');
}

function renderSearchResults(results, query) {
  if (!searchDropdown) return;

  if (results.length === 0) {
    searchDropdown.innerHTML = `
      <div class="px-4 py-3 text-sm text-slate-400 text-center">No tasks found</div>
    `;
    return;
  }

  searchDropdown.innerHTML = results.map(item => `
    <div class="search-result px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3" data-search-task-id="${item.id}">
      <span class="material-symbols-outlined text-slate-400 text-sm">task</span>
      <div class="min-w-0">
        <div class="text-sm font-medium truncate">${highlightMatch(item.title, query)}</div>
        <div class="text-xs text-slate-400 truncate">${item.description}</div>
      </div>
    </div>
  `).join('');
}

if (searchInput && searchDropdown) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();

    if (!query) {
      searchDropdown.classList.add('hidden');
      searchDropdown.innerHTML = '';
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);

    renderSearchResults(results, query);
    searchDropdown.classList.remove('hidden');
  });

  // Click result → open View Task modal (event delegation)
  searchDropdown.addEventListener('click', (e) => {
    const result = e.target.closest('.search-result');
    if (!result) return;

    const taskId = result.dataset.searchTaskId;
    const card = document.querySelector(`[data-task-id="${taskId}"]`);
    if (card) {
      openViewModal(card);
    }

    searchInput.value = '';
    searchDropdown.classList.add('hidden');
    searchDropdown.innerHTML = '';
  });

  // Dismiss dropdown on click outside
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
      searchDropdown.classList.add('hidden');
    }
  });

  // Dismiss on Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchDropdown.classList.add('hidden');
      searchInput.blur();
    }
  });
}
