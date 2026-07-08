import { db, auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, 
    onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// State
let currentTab = 'news';
let unsubscribe = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const adminForm = document.getElementById('admin-form');
const itemsList = document.getElementById('items-list');
const tabButtons = document.querySelectorAll('.tab-btn');
const formFields = document.getElementById('form-fields');
const editorTitle = document.getElementById('editor-title');

// 1. Auth Logic
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        switchTab('news');
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        errorMsg.textContent = "Login Failed: " + err.message;
        errorMsg.style.display = 'block';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

// 2. Tab Management
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchTab(btn.dataset.tab);
    });
});

function switchTab(tab) {
    currentTab = tab;
    editorTitle.textContent = `Add ${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
    adminForm.reset();
    document.getElementById('item-id').value = '';
    renderFields();
    listenToCollection();
}

// 3. Dynamic Form Fields
function renderFields() {
    let html = '';
    if (currentTab === 'news') {
        html = `
            <div><label>Title</label><input type="text" id="title" required></div>
            <div><label>Summary</label><textarea id="summary" required></textarea></div>
            <div><label>Date</label><input type="date" id="date" required></div>
            <div><label>Image</label><input type="file" id="image-file" accept="image/*"><img id="image-preview"></div>
        `;
    } else if (currentTab === 'events') {
        html = `
            <div><label>Event Title</label><input type="text" id="title" required></div>
            <div><label>Date</label><input type="date" id="date" required></div>
            <div><label>Time</label><input type="text" id="time" placeholder="e.g. 10:00 AM" required></div>
            <div><label>Location</label><input type="text" id="location" required></div>
            <div><label>Description</label><textarea id="description" required></textarea></div>
        `;
    } else if (currentTab === 'sermons') {
        html = `
            <div><label>Title</label><input type="text" id="title" required></div>
            <div><label>Preacher</label><input type="text" id="preacher" required></div>
            <div><label>Date</label><input type="date" id="date" required></div>
            <div><label>Video/Audio Link (URL)</label><input type="url" id="linkUrl" required></div>
        `;
    } else if (currentTab === 'gallery') {
        html = `
            <div><label>Caption</label><input type="text" id="caption"></div>
            <div><label>Date</label><input type="date" id="date" required></div>
            <div><label>Image</label><input type="file" id="image-file" accept="image/*" required><img id="image-preview"></div>
        `;
    }
    formFields.innerHTML = html;
    
    // Setup preview for image files
    const fileInput = document.getElementById('image-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleImageSelect);
    }
}

// 4. Image Pipeline
let processedBase64 = null;

async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 1200;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            processedBase64 = canvas.toDataURL('image/jpeg', 0.75);
            
            const preview = document.getElementById('image-preview');
            preview.src = processedBase64;
            preview.style.display = 'block';
            
            const sizeKB = Math.round((processedBase64.length * 3/4) / 1024);
            console.log(`Image processed: ~${sizeKB} KB`);
            
            if (processedBase64.length > 1000000) {
                alert("Image is too large even after compression. Please use a smaller file.");
                processedBase64 = null;
                e.target.value = '';
            }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 5. CRUD Operations
adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = document.getElementById('item-id').value;
    const data = {
        updatedAt: serverTimestamp()
    };

    // Gather common fields
    if (document.getElementById('title')) data.title = document.getElementById('title').value;
    if (document.getElementById('date')) data.date = document.getElementById('date').value;
    if (document.getElementById('summary')) data.summary = document.getElementById('summary').value;
    if (document.getElementById('description')) data.description = document.getElementById('description').value;
    if (document.getElementById('time')) data.time = document.getElementById('time').value;
    if (document.getElementById('location')) data.location = document.getElementById('location').value;
    if (document.getElementById('preacher')) data.preacher = document.getElementById('preacher').value;
    if (document.getElementById('linkUrl')) data.linkUrl = document.getElementById('linkUrl').value;
    if (document.getElementById('caption')) data.caption = document.getElementById('caption').value;
    
    if (processedBase64) {
        data.imageBase64 = processedBase64;
    }

    try {
        if (id) {
            await updateDoc(doc(db, currentTab, id), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, currentTab), data);
        }
        adminForm.reset();
        document.getElementById('item-id').value = '';
        processedBase64 = null;
        if (document.getElementById('image-preview')) document.getElementById('image-preview').style.display = 'none';
        alert("Item saved successfully!");
    } catch (err) {
        console.error(err);
        alert("Error saving: " + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Item';
    }
});

function listenToCollection() {
    if (unsubscribe) unsubscribe();
    
    const q = query(collection(db, currentTab), orderBy('createdAt', 'desc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
        itemsList.innerHTML = '';
        snapshot.forEach(docSnap => {
            const item = docSnap.data();
            const div = document.createElement('div');
            div.className = 'admin-item';
            div.innerHTML = `
                <span>${item.title || item.caption || 'Untitled'} (${item.date || 'No Date'})</span>
                <div>
                    <button class="btn-delete" onclick="window.deleteItem('${docSnap.id}')">Delete</button>
                </div>
            `;
            itemsList.appendChild(div);
        });
    });
}

window.deleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this?")) {
        try {
            await deleteDoc(doc(db, currentTab, id));
        } catch (err) {
            alert("Error deleting: " + err.message);
        }
    }
};

document.getElementById('cancel-btn').addEventListener('click', () => {
    adminForm.reset();
    document.getElementById('item-id').value = '';
    processedBase64 = null;
    if (document.getElementById('image-preview')) document.getElementById('image-preview').style.display = 'none';
    editorTitle.textContent = `Add ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`;
});
