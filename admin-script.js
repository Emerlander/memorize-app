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

        this.exercises = [];
        this.editingIndex = -1;

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
}

// Global instance for onclick handlers
let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});