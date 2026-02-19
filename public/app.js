 
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmImt8r4p_pcIZkV93Atp-udQAzqkeqxY",
    authDomain: "school-bb8a1.firebaseapp.com",
    databaseURL: "https://school-bb8a1-default-rtdb.firebaseio.com",
    projectId: "school-bb8a1",
    storageBucket: "school-bb8a1.firebasestorage.app",
    messagingSenderId: "503291779180",
    appId: "1:503291779180:web:fc998a9cbc2d3d43216049",
    measurementId: "G-MH1RFRQ9GX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const elements = {
    // Auth
    loginForm: document.getElementById('login-form'),
    userInfo: document.getElementById('user-info'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    signupBtn: document.getElementById('signup-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    userEmail: document.getElementById('user-email'),
    authError: document.getElementById('auth-error'),
    
    // Main Content
    mainContent: document.getElementById('main-content'),
    
    // Dashboard
    studentCount: document.getElementById('student-count'),
    teacherCount: document.getElementById('teacher-count'),
    courseCount: document.getElementById('course-count'),
    
    // Student Management
    studentName: document.getElementById('student-name'),
    studentGrade: document.getElementById('student-grade'),
    addStudentBtn: document.getElementById('add-student-btn'),
    studentsList: document.getElementById('students-list'),
    
    // File Upload
    fileInput: document.getElementById('file-input'),
    uploadBtn: document.getElementById('upload-btn'),
    filesList: document.getElementById('files-list'),
    
    // Status
    syncStatus: document.getElementById('sync-status')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('School Management System loaded');
    initializeEventListeners();
    setupAuthStateListener();
    showToast('Welcome to School Management System!', 'info');
});

// Event Listeners
function initializeEventListeners() {
    // Auth Listeners
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', handleLogin);
        console.log('Login button initialized');
    }
    
    if (elements.signupBtn) {
        elements.signupBtn.addEventListener('click', handleSignup);
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Student Management
    if (elements.addStudentBtn) {
        elements.addStudentBtn.addEventListener('click', addStudent);
    }
    
    // File Upload
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', uploadFile);
    }
    
    // Enter key for login
    if (elements.passwordInput) {
        elements.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
}

// Authentication Functions
async function handleLogin() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;
    
    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }
    
    try {
        showToast('Logging in...', 'info');
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Create/update user document
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            platform: 'web',
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        showToast(`Welcome back, ${email}!`, 'success');
        
    } catch (error) {
        showError(getAuthErrorMessage(error.code));
    }
}

async function handleSignup() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;
    
    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        showToast('Creating account...', 'info');
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user document
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            platform: 'web',
            role: 'user'
        });
        
        showToast('Account created successfully!', 'success');
        
    } catch (error) {
        showError(getAuthErrorMessage(error.code));
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        showToast('Logged out successfully', 'info');
    } catch (error) {
        showError('Logout failed: ' + error.message);
    }
}

// Auth State Listener
function setupAuthStateListener() {
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state:', user ? 'Logged in' : 'Logged out');
        
        if (user) {
            // User is signed in
            elements.loginForm.classList.add('hidden');
            elements.userInfo.classList.remove('hidden');
            elements.mainContent.classList.remove('hidden');
            elements.userEmail.textContent = user.email;
            
            // Load user data
            await loadUserData(user.uid);
            
            // Update status
            elements.syncStatus.textContent = 'Connected to Firebase';
            elements.syncStatus.style.color = '#10b981';
            
        } else {
            // User is signed out
            elements.loginForm.classList.remove('hidden');
            elements.userInfo.classList.add('hidden');
            elements.mainContent.classList.add('hidden');
            elements.syncStatus.textContent = 'Disconnected';
            elements.syncStatus.style.color = '#ef4444';
        }
    });
}

// Load User Data
async function loadUserData(userId) {
    try {
        console.log('Loading user data for:', userId);
        
        // Load dashboard stats
        await loadDashboardStats();
        
        // Load students
        await loadStudents();
        
        // Load files
        await loadFiles(userId);
        
        showToast('Data loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load data: ' + error.message);
    }
}

// Dashboard Functions
async function loadDashboardStats() {
    try {
        // Students count
        const studentsSnapshot = await db.collection('students').get();
        elements.studentCount.textContent = studentsSnapshot.size;
        
        // Teachers count
        try {
            const teachersSnapshot = await db.collection('teachers').get();
            elements.teacherCount.textContent = teachersSnapshot.size;
        } catch (error) {
            elements.teacherCount.textContent = '0';
        }
        
        // Courses count
        try {
            const coursesSnapshot = await db.collection('courses').get();
            elements.courseCount.textContent = coursesSnapshot.size;
        } catch (error) {
            elements.courseCount.textContent = '0';
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load Students
async function loadStudents() {
    try {
        // Clear current list
        elements.studentsList.innerHTML = '';
        
        // Listen for real-time updates
        db.collection('students')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                elements.studentsList.innerHTML = '';
                
                if (snapshot.empty) {
                    elements.studentsList.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 20px;">
                                No students added yet
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                snapshot.forEach((doc) => {
                    const student = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.name || 'Unknown'}</td>
                        <td>${student.grade || 'N/A'}</td>
                        <td>${student.createdAt ? student.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                        <td>
                            <button class="btn-small btn-danger" onclick="deleteStudent('${doc.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    `;
                    elements.studentsList.appendChild(row);
                });
                
                // Update count
                elements.studentCount.textContent = snapshot.size;
            });
            
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Add Student
async function addStudent() {
    const name = elements.studentName.value.trim();
    const grade = elements.studentGrade.value.trim();
    
    if (!name || !grade) {
        showError('Please enter student name and grade');
        return;
    }
    
    try {
        const user = auth.currentUser;
        await db.collection('students').add({
            name: name,
            grade: grade,
            addedBy: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid
        });
        
        // Clear inputs
        elements.studentName.value = '';
        elements.studentGrade.value = '';
        
        showToast('Student added successfully!', 'success');
        
    } catch (error) {
        showError('Failed to add student: ' + error.message);
    }
}

// File Upload Functions
async function uploadFile() {
    const file = elements.fileInput.files[0];
    if (!file) {
        showError('Please select a file to upload');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    try {
        const user = auth.currentUser;
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = storage.ref(`shared_files/${user.uid}/${fileName}`);
        
        showToast('Uploading file...', 'info');
        
        // Upload file
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Save file metadata to Firestore
        await db.collection('files').add({
            name: file.name,
            url: downloadURL,
            size: file.size,
            type: file.type,
            uploadedBy: user.email,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid
        });
        
        // Clear input
        elements.fileInput.value = '';
        
        showToast('File uploaded successfully!', 'success');
        
    } catch (error) {
        showError('Upload failed: ' + error.message);
    }
}

// Load Files
async function loadFiles(userId) {
    try {
        // Listen for files
        db.collection('files')
            .where('userId', '==', userId)
            .orderBy('uploadedAt', 'desc')
            .onSnapshot((snapshot) => {
                elements.filesList.innerHTML = '';
                
                if (snapshot.empty) {
                    elements.filesList.innerHTML = '<p class="no-files">No files uploaded yet</p>';
                    return;
                }
                
                snapshot.forEach((doc) => {
                    const file = doc.data();
                    const fileCard = document.createElement('div');
                    fileCard.className = 'file-card';
                    fileCard.innerHTML = `
                        <div class="file-header">
                            <i class="fas fa-file"></i>
                            <h4>${file.name}</h4>
                        </div>
                        <div class="file-details">
                            <p>Size: ${formatFileSize(file.size)}</p>
                            <p>Uploaded: ${file.uploadedAt ? file.uploadedAt.toDate().toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div class="file-actions">
                            <a href="${file.url}" target="_blank" class="btn-small btn-primary">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>
                    `;
                    elements.filesList.appendChild(fileCard);
                });
            });
            
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Global functions for delete buttons
window.deleteStudent = async function(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await db.collection('students').doc(studentId).delete();
            showToast('Student deleted successfully', 'success');
        } catch (error) {
            showError('Failed to delete student: ' + error.message);
        }
    }
};

// Utility Functions
function showError(message) {
    if (elements.authError) {
        elements.authError.textContent = message;
        elements.authError.className = 'alert alert-error';
        elements.authError.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            elements.authError.classList.add('hidden');
        }, 5000);
    }
    
    // Also show toast
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        default: return 'fa-info-circle';
    }
}

function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getAuthErrorMessage(errorCode) {
    switch(errorCode) {
        case 'auth/invalid-email': return 'Invalid email address';
        case 'auth/user-not-found': return 'No account found with this email';
        case 'auth/wrong-password': return 'Incorrect password';
        case 'auth/email-already-in-use': return 'Email already registered';
        case 'auth/weak-password': return 'Password is too weak';
        case 'auth/network-request-failed': return 'Network error. Please check your connection';
        default: return 'Authentication failed. Please try again';
    }
}

// Initialize the app
console.log('School Management System initialized');