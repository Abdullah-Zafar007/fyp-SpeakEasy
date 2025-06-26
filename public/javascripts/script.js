const quizData = {
    easy: [
        { question: "Pronounce the word 'کتاب' (Book).", correctPronunciation: "کتاب" },
        { question: "What is the Urdu name for the month 'January'?", correctPronunciation: "جنوری" },
        { question: "Pronounce the word 'سیب' (Apple).", correctPronunciation: "سیب" },
        { question: "Pronounce the word 'گوبھی' (Cauliflower).", correctPronunciation: "گوبھی" },
        { question: "Pronounce the number 'ایک' (1).", correctPronunciation: "ایک" },
        { question: "Pronounce the sentence: 'پانی صاف ہے' (The water is clear).", correctPronunciation: "پانی صاف ہے" },
        { question: "Pronounce the word 'درخت' (Tree).", correctPronunciation: "درخت" },
        { question: "Pronounce the word 'گائے' (Cow).", correctPronunciation: "گائے" },
        { question: "Pronounce the word 'کیلا' (Banana).", correctPronunciation: "کیلا" },
        { question: "Pronounce the word 'مسجد' (Mosque).", correctPronunciation: "مسجد" }
    ],
    medium: [
        { question: "Pronounce the word 'گلاب' (Rose).", correctPronunciation: "گلاب" },
        { question: "What is the Urdu name for the month 'March'?", correctPronunciation: "مارچ" },
        { question: "Pronounce the word 'انار' (Pomegranate).", correctPronunciation: "انار" },
        { question: "Pronounce the word 'گاجر' (Carrot).", correctPronunciation: "گاجر" },
        { question: "Pronounce the number 'پانچ' (5).", correctPronunciation: "پانچ" },
        { question: "Pronounce the sentence: 'دن بہت اچھا ہے' (The day is very nice).", correctPronunciation: "دن بہت اچھا ہے" },
        { question: "Pronounce the word 'چاند' (Moon).", correctPronunciation: "چاند" },
        { question: "Pronounce the word 'کتا' (Dog).", correctPronunciation: "کتا" },
        { question: "Pronounce the word 'پپیتا' (Papaya).", correctPronunciation: "پپیتا" },
        { question: "Pronounce the word 'کتب خانہ' (Library).", correctPronunciation: "کتب خانہ" }
    ],
    hard: [
        { question: "Pronounce the word 'مکتبہ' (Library).", correctPronunciation: "مکتبہ" },
        { question: "What is the Urdu name for the month 'November'?", correctPronunciation: "نومبر" },
        { question: "Pronounce the word 'انگور' (Grapes).", correctPronunciation: "انگور" },
        { question: "Pronounce the word 'مٹر' (Peas).", correctPronunciation: "مٹر" },
        { question: "Pronounce the number 'پانچ' (5).", correctPronunciation: "پانچ" },
        { question: "Pronounce the sentence: 'وہ کتابیں پڑھ رہا ہے' (He is reading books).", correctPronunciation: "وہ کتابیں پڑھ رہا ہے" },
        { question: "Pronounce the word 'دریا' (River).", correctPronunciation: "دریا" },
        { question: "Pronounce the word 'ہاتھی' (Elephant).", correctPronunciation: "ہاتھی" },
        { question: "Pronounce the word 'خوبانی' (Apricot).", correctPronunciation: "خوبانی" },
        { question: "Pronounce the sentence: 'پانی صاف ہے' (The water is clear).", correctPronunciation: "پانی صاف ہے" }
    ]
};

let currentLevel = 'easy';
let currentQuestionIndex = 0;
let userAnswers = [];

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ur-PK';
recognition.interimResults = false;

function showInstructions() {
    const instructions = document.getElementById('instructions');
    instructions.style.display = 'block';
}

function showQuizQuestions() {
    const quizContainer = document.getElementById('quizContainer');
    const questionElement = document.getElementById('question');

    const currentQuestion = quizData[currentLevel][currentQuestionIndex];
    questionElement.textContent = `Pronounce the word: ${currentQuestion.question}`;

    quizContainer.style.display = 'block';
    document.getElementById('startSpeech').style.display = 'inline-block';
}

function startSpeechRecognition() {
    recognition.start();
    console.log('Listening for pronunciation...');
}

recognition.onresult = function(event) {
    const userAnswer = event.results[0][0].transcript;
    console.log(`User pronounced: ${userAnswer}`);

    const currentQuestion = quizData[currentLevel][currentQuestionIndex];
    userAnswers.push({
        question: currentQuestion.question,
        userPronunciation: userAnswer,
        correctPronunciation: currentQuestion.correctPronunciation
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < quizData[currentLevel].length) {
        showQuizQuestions();
    } else {
        showResults(); // ✅ Now evaluation is done once from here
    }
};

function evaluatePronunciation(userAnswers) {
    const userId = localStorage.getItem('user_id');

    fetch('/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            answers: userAnswers,
            user_id: userId,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Evaluation result:', data);
    })
    .catch(error => {
        console.error('Error during evaluation:', error);
    });
}

function showResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.style.display = 'block';

    let correctAnswers = 0;
    let mistakes = [];

    userAnswers.forEach(answer => {
        if (answer.userPronunciation === answer.correctPronunciation) {
            correctAnswers++;
        } else {
            mistakes.push({
                word: answer.question,
                correctPronunciation: answer.correctPronunciation,
                userPronunciation: answer.userPronunciation
            });
        }
    });

    document.getElementById('score').textContent = `Your Score: ${correctAnswers} / ${quizData[currentLevel].length}`;

    if (mistakes.length > 0) {
        const mistakesList = document.getElementById('mistakes');
        mistakesList.innerHTML = '';
        mistakes.forEach(mistake => {
            const mistakeItem = document.createElement('li');
            mistakeItem.textContent = `Word: ${mistake.word} - Correct: ${mistake.correctPronunciation}, You said: ${mistake.userPronunciation}`;
            mistakesList.appendChild(mistakeItem);
        });
    }

    const conclusion = document.createElement('p');
    conclusion.textContent = 'Keep practicing the mispronounced words! If you face any difficulty, please take an appointment with a therapist.';
    resultsContainer.appendChild(conclusion);

    // ✅ Evaluate only once, after the quiz is complete
    evaluatePronunciation(userAnswers);
}

function changeLevel(level) {
    currentLevel = level;
    currentQuestionIndex = 0;
    userAnswers = [];
    showQuizQuestions();
}

document.getElementById('startQuizBtn').addEventListener('click', function() {
    showInstructions();
    showQuizQuestions();
});

document.getElementById('level').addEventListener('change', function(event) {
    changeLevel(event.target.value);
});

document.getElementById('startSpeech').addEventListener('click', function() {
    startSpeechRecognition();
});
