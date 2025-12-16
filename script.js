class WordOrderingGame {
    constructor() {
        this.availableWordsContainer = document.getElementById('availableWords');
        this.selectedWordsContainer = document.getElementById('selectedWords');
        this.checkBtn = document.getElementById('checkBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.resultDiv = document.getElementById('result');

        this.currentExercise = null;
        this.selectedWords = [];

        this.init();
    }

    init() {
        this.loadExerciseData();
        this.bindEvents();
    }

    loadExerciseData() {
        const exercises = JSON.parse(localStorage.getItem('wordExercises') || '[]');

        if (exercises.length === 0) {
            this.loadDefaultExercise();
        } else {
            const randomIndex = Math.floor(Math.random() * exercises.length);
            this.currentExercise = exercises[randomIndex];
        }

        this.displayWords();
    }

    loadDefaultExercise() {
        this.currentExercise = {
            words: ['The', 'cat', 'is', 'sleeping', 'peacefully'],
            correctAnswer: 'The cat is sleeping peacefully'
        };
    }

    displayWords() {
        this.availableWordsContainer.innerHTML = '';
        this.selectedWordsContainer.innerHTML = '';
        this.selectedWords = [];
        this.resultDiv.classList.add('hidden');

        const shuffledWords = [...this.currentExercise.words].sort(() => Math.random() - 0.5);

        shuffledWords.forEach(word => {
            const wordElement = this.createWordElement(word);
            this.availableWordsContainer.appendChild(wordElement);
        });
    }

    createWordElement(word) {
        const wordElement = document.createElement('button');
        wordElement.className = 'word';
        wordElement.textContent = word;
        wordElement.addEventListener('click', () => this.handleWordClick(wordElement, word));
        return wordElement;
    }

    handleWordClick(wordElement, word) {
        const isInAvailable = this.availableWordsContainer.contains(wordElement);
        const isInSelected = this.selectedWordsContainer.contains(wordElement);

        if (isInAvailable) {
            this.moveWordToSelected(wordElement, word);
        } else if (isInSelected) {
            this.moveWordToAvailable(wordElement, word);
        }
    }

    moveWordToSelected(wordElement, word) {
        this.availableWordsContainer.removeChild(wordElement);
        this.selectedWordsContainer.appendChild(wordElement);
        this.selectedWords.push(word);
    }

    moveWordToAvailable(wordElement, word) {
        const wordIndex = this.selectedWords.indexOf(word);
        if (wordIndex > -1) {
            this.selectedWords.splice(wordIndex, 1);
        }

        this.selectedWordsContainer.removeChild(wordElement);
        this.availableWordsContainer.appendChild(wordElement);
    }

    bindEvents() {
        this.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    checkAnswer() {
        if (this.selectedWords.length === 0) {
            this.showResult('Please select some words to form a sentence.', false);
            return;
        }

        const userAnswer = this.selectedWords.join(' ');
        const isCorrect = userAnswer.toLowerCase().trim() ===
                         this.currentExercise.correctAnswer.toLowerCase().trim();

        if (isCorrect) {
            this.showResult('🎉 Correct! Well done!', true);
        } else {
            this.showResult(`❌ Incorrect. The correct answer is: "${this.currentExercise.correctAnswer}"`, false);
        }
    }

    showResult(message, isCorrect) {
        this.resultDiv.textContent = message;
        this.resultDiv.className = `result ${isCorrect ? 'correct' : 'incorrect'}`;
        this.resultDiv.classList.remove('hidden');

        this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    resetGame() {
        this.loadExerciseData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WordOrderingGame();
});