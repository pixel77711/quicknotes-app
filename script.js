
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const clearAllButton = document.querySelector("#clear-all");

const STORAGE_KEY = "quicknotes-notes";

function loadNotes() {
  try {
    const savedNotes = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (!Array.isArray(savedNotes)) {
      return [];
    }

    return savedNotes.filter(note =>
      note &&
      typeof note.id === "string" &&
      typeof note.text === "string" &&
      ["Personal", "Work", "Study"].includes(note.category) &&
      typeof note.createdAt === "string"
    );
  } catch (error) {
    return [];
  }
}

let notes = loadNotes();

function saveNotes() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

function render() {
  notesList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchTerm)
  );

  updateCount();

  if (filteredNotes.length === 0) {
    const message = document.createElement("li");
    message.className = "empty-message";

    message.textContent = searchTerm
      ? "No notes match your search."
      : "Your notes will appear here.";

    notesList.appendChild(message);
    return;
  }

  filteredNotes.forEach(note => {
    const listItem = document.createElement("li");

    listItem.classList.add(
      "note-card",
      `category-${note.category.toLowerCase()}`
    );

    const categoryLabel = document.createElement("span");
    categoryLabel.className = "category-label";
    categoryLabel.textContent = note.category;

    const noteHeader = document.createElement("div");
    noteHeader.className = "note-header";

    const noteText = document.createElement("p");
    noteText.className = "note-text";
    noteText.textContent = note.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id);
    });

    const date = document.createElement("p");
    date.className = "note-date";
    date.textContent = note.createdAt;

    noteHeader.append(noteText, deleteButton);
    listItem.append(categoryLabel, noteHeader, date);
    notesList.appendChild(listItem);
  });
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);

  saveNotes();
  render();
}

noteForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = noteInput.value.trim();

  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent =
      "Notes must be 200 characters or fewer.";
    return;
  }

  const note = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    text: text,
    category: noteCategory.value,
    createdAt: new Date().toLocaleString()
  };

  notes.unshift(note);

  saveNotes();

  errorMessage.textContent = "";
  noteInput.value = "";

  render();
  noteInput.focus();
});

searchInput.addEventListener("input", render);

clearAllButton.addEventListener("click", () => {
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    render();
  }
});

render();
