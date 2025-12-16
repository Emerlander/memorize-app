// Password Protection
const PASSWORD = 'coolness'; // Change this to your desired password

class PasswordProtection {
    constructor() {
        this.passwordOverlay = document.getElementById('passwordOverlay');
        this.passwordForm = document.getElementById('passwordForm');
        this.passwordInput = document.getElementById('passwordInput');
        this.passwordError = document.getElementById('passwordError');
        this.adminContent = document.getElementById('adminContent');
        this.toggleButton = document.getElementById('togglePassword');
        this.toggleIcon = document.getElementById('toggleIcon');

        this.init();
    }

    init() {
        // Check if already authenticated
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

        if (isAuthenticated) {
            this.showAdminPanel();
        } else {
            this.bindPasswordEvents();
        }
    }

    bindPasswordEvents() {
        this.passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkPassword();
        });

        // Toggle password visibility
        this.toggleButton.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;

            // Toggle icon
            this.toggleIcon.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    checkPassword() {
        const enteredPassword = this.passwordInput.value;

        if (enteredPassword === PASSWORD) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            this.showAdminPanel();
        } else {
            this.passwordError.textContent = 'Incorrect password. Please try again.';
            this.passwordInput.value = '';
            this.passwordInput.focus();

            // Clear error message after 3 seconds
            setTimeout(() => {
                this.passwordError.textContent = '';
            }, 3000);
        }
    }

    showAdminPanel() {
        this.passwordOverlay.style.display = 'none';
        this.adminContent.style.display = 'block';

        // Initialize the admin panel after authentication
        new AdminPanel();
    }
}

class AdminPanel {
    constructor() {
        this.exerciseForm = document.getElementById('exerciseForm');
        this.wordsInput = document.getElementById('wordsInput');
        this.correctAnswerInput = document.getElementById('correctAnswer');
        this.exercisesList = document.getElementById('exercisesList');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');

        // CSV Upload elements
        this.csvFileInput = document.getElementById('csvFileInput');
        this.csvUploadBtn = document.getElementById('csvUploadBtn');
        this.csvFileName = document.getElementById('csvFileName');
        this.processCsvBtn = document.getElementById('processCsvBtn');
        this.csvStatus = document.getElementById('csvStatus');
        this.downloadTemplateBtn = document.getElementById('downloadTemplateBtn');

        this.exercises = [];
        this.editingIndex = -1;
        this.csvData = null;

        this.init();
    }

    init() {
        this.loadExercises();
        this.displayExercises();
        this.bindEvents();
    }

    loadExercises() {
        this.exercises = JSON.parse(localStorage.getItem('wordExercises') || '[]');
    }

    saveExercises() {
        localStorage.setItem('wordExercises', JSON.stringify(this.exercises));
    }

    bindEvents() {
        this.exerciseForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.clearAllBtn.addEventListener('click', () => this.clearAllExercises());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importData(e));

        // CSV Upload events
        this.csvUploadBtn.addEventListener('click', () => this.csvFileInput.click());
        this.csvFileInput.addEventListener('change', (e) => this.handleCsvFileSelect(e));
        this.processCsvBtn.addEventListener('click', () => this.processCsvFile());
        this.downloadTemplateBtn.addEventListener('click', () => this.downloadCsvTemplate());
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const wordsText = this.wordsInput.value.trim();
        const correctAnswer = this.correctAnswerInput.value.trim();

        if (!wordsText || !correctAnswer) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        const words = wordsText.split(',').map(word => word.trim()).filter(word => word.length > 0);

        if (words.length < 2) {
            this.showMessage('Please enter at least 2 words.', 'error');
            return;
        }

        const exercise = {
            words: words,
            correctAnswer: correctAnswer
        };

        if (this.editingIndex >= 0) {
            this.exercises[this.editingIndex] = exercise;
            this.editingIndex = -1;
            this.showMessage('Exercise updated successfully!', 'success');
        } else {
            this.exercises.push(exercise);
            this.showMessage('Exercise added successfully!', 'success');
        }

        this.saveExercises();
        this.displayExercises();
        this.resetForm();
    }

    displayExercises() {
        if (this.exercises.length === 0) {
            this.exercisesList.innerHTML = '<p style="text-align: center; color: #5a7a5a; padding: 20px;">No exercises added yet.</p>';
            return;
        }

        this.exercisesList.innerHTML = this.exercises
            .map((exercise, index) => this.createExerciseHTML(exercise, index))
            .join('');
    }

    createExerciseHTML(exercise, index) {
        return `
            <div class="exercise-item">
                <div class="exercise-content">
                    <div class="exercise-words">Words: ${exercise.words.join(', ')}</div>
                    <div class="exercise-answer">Correct Answer: "${exercise.correctAnswer}"</div>
                </div>
                <div class="exercise-actions">
                    <button class="btn-small btn-edit" onclick="adminPanel.editExercise(${index})">Edit</button>
                    <button class="btn-small btn-delete" onclick="adminPanel.deleteExercise(${index})">Delete</button>
                </div>
            </div>
        `;
    }

    editExercise(index) {
        const exercise = this.exercises[index];
        this.wordsInput.value = exercise.words.join(', ');
        this.correctAnswerInput.value = exercise.correctAnswer;
        this.editingIndex = index;

        this.exerciseForm.querySelector('button[type="submit"]').textContent = 'Update Exercise';
        this.wordsInput.focus();
    }

    deleteExercise(index) {
        if (confirm('Are you sure you want to delete this exercise?')) {
            this.exercises.splice(index, 1);
            this.saveExercises();
            this.displayExercises();
            this.showMessage('Exercise deleted successfully!', 'success');
        }
    }

    clearAllExercises() {
        if (confirm('Are you sure you want to clear all exercises? This action cannot be undone.')) {
            this.exercises = [];
            this.saveExercises();
            this.displayExercises();
            this.showMessage('All exercises cleared!', 'success');
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.exercises, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'word-exercises.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);

                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid file format');
                }

                // Validate each exercise
                for (const exercise of importedData) {
                    if (!exercise.words || !Array.isArray(exercise.words) ||
                        !exercise.correctAnswer || typeof exercise.correctAnswer !== 'string') {
                        throw new Error('Invalid exercise format');
                    }
                }

                this.exercises = importedData;
                this.saveExercises();
                this.displayExercises();
                this.showMessage('Data imported successfully!', 'success');
            } catch (error) {
                this.showMessage('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);

        // Reset the file input
        e.target.value = '';
    }

    resetForm() {
        this.wordsInput.value = '';
        this.correctAnswerInput.value = '';
        this.editingIndex = -1;
        this.exerciseForm.querySelector('button[type="submit"]').textContent = 'Add Exercise';
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        this.exerciseForm.insertAdjacentElement('afterend', messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // CSV Upload Methods
    handleCsvFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            this.showCsvStatus('Please select a valid CSV file', 'error');
            return;
        }

        this.csvFileName.textContent = file.name;
        this.processCsvBtn.disabled = false;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.csvData = event.target.result;
        };
        reader.readAsText(file);
    }

    processCsvFile() {
        if (!this.csvData) return;

        try {
            const lines = this.csvData.split('\n').filter(line => line.trim());
            const newExercises = [];

            for (const line of lines) {
                const sentence = line.trim();
                if (sentence) {
                    // Split sentence into words
                    const words = sentence.split(/\s+/);

                    // Create exercise object
                    newExercises.push({
                        words: words,
                        correct: sentence,
                        id: Date.now() + Math.random()
                    });
                }
            }

            if (newExercises.length === 0) {
                this.showCsvStatus('No valid sentences found in CSV', 'error');
                return;
            }

            // Add new exercises to existing ones
            this.exercises = [...this.exercises, ...newExercises];
            this.saveExercises();
            this.displayExercises();

            // Reset CSV upload
            this.csvFileInput.value = '';
            this.csvFileName.textContent = 'No file selected';
            this.processCsvBtn.disabled = true;
            this.csvData = null;

            this.showCsvStatus(`Successfully imported ${newExercises.length} exercises!`, 'success');
            this.showMessage(`${newExercises.length} exercises added from CSV!`, 'success');

        } catch (error) {
            this.showCsvStatus('Error processing CSV file', 'error');
            console.error('CSV processing error:', error);
        }
    }

    downloadCsvTemplate() {
        const sampleContent = `The cat is sleeping peacefully
She loves reading books daily
We are going to school tomorrow
The weather is beautiful today
They completed their homework successfully
I enjoy playing basketball with friends
The restaurant serves delicious Italian food
Students are studying for exams diligently
My favorite color is blue
Technology makes our lives easier`;

        const blob = new Blob([sampleContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_sentences.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showMessage('Sample CSV template downloaded!', 'success');
    }

    showCsvStatus(message, type) {
        this.csvStatus.textContent = message;
        this.csvStatus.className = `status-message ${type}`;

        setTimeout(() => {
            this.csvStatus.textContent = '';
            this.csvStatus.className = 'status-message';
        }, 5000);
    }
}

// Global instance for onclick handlers
// Initialize password protection when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PasswordProtection();
});