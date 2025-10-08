const usersContainer = document.getElementById("users");
const statusBox = document.getElementById("status");
const editModal = document.getElementById("editModal");
const closeModalBtn = document.getElementById("closeModal");
const saveEditBtn = document.getElementById("saveEdit");
let editUserId = null;
let users = [];
function showStatus(msg, error = false) {
  statusBox.textContent = msg;
  statusBox.className = error ? "error" : "";
  statusBox.classList.remove("hidden");
  setTimeout(() => statusBox.classList.add("hidden"), 2500);
}
async function getUsers() {
  usersContainer.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error("Failed to load users");
    users = await res.json();
    renderUsers();
  } catch (err) {
    showStatus("Error loading users", true);
  }
}
function renderUsers() {
  usersContainer.innerHTML = users.map(u => `
    <div class="card">
      <h3>${u.name}</h3>
      <p class="meta">${u.email}</p>
      <p class="meta">${u.phone}</p>
      <div class="row">
        <button class="small" onclick="editUser(${u.id})">Edit</button>
        <button class="small" onclick="deleteUser(${u.id})">Delete</button>
      </div>
    </div>
  `).join("");
}
document.getElementById("createForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    });
    if (!res.ok) throw new Error("Request failed " + res.status);
    const newUser = await res.json();
    newUser.id = Date.now();
    users.push(newUser);
    renderUsers();
    showStatus("User created!");
    e.target.reset();
  } catch (err) {
    showStatus("Create failed: " + err.message, true);
  }
});
function editUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;
  editUserId = id;
  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editPhone").value = user.phone;
  editModal.classList.remove("hidden");
}
closeModalBtn.onclick = () => editModal.classList.add("hidden");
saveEditBtn.onclick = async () => {
  const name = document.getElementById("editName").value;
  const email = document.getElementById("editEmail").value;
  const phone = document.getElementById("editPhone").value;
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${editUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    });
    if (!res.ok && res.status !== 200 && res.status !== 201)
      throw new Error("Request failed " + res.status);

    const idx = users.findIndex(u => u.id === editUserId);
    users[idx] = { ...users[idx], name, email, phone };
    renderUsers();
    showStatus("User updated!");
    editModal.classList.add("hidden");
  } catch (err) {
    showStatus("Update failed: " + err.message, true);
  }
};
async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 200 && res.status !== 204)
      throw new Error("Request failed " + res.status);
    users = users.filter(u => u.id !== id);
    renderUsers();
    showStatus("User deleted!");
  } catch (err) {
    showStatus("Delete failed: " + err.message, true);
  }
}

getUsers();
