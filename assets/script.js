/**
 * The questions array contains all the questions used in the quiz.
 * Each item in the array is an object structured as follows:
 *      question: string holding the question
 *      answer: string holding the correct answer
 *      distractors: array of at 3 strings, each representing an incorrect answer
 * The strings contained within each object may contain inline HTML elements (e.g. <em>, <code>).
 */
 const questions = [
    /* question data template
    {
        question: 'question',
        answer: 'answer',
        distractors: [
            'distractor1',
            'distractor2',
            'distractor3'
        ]
    },
    */
    {
        question: 'What does <code>typeof typeof 1</code> evaluate to?',
        answer: '<code>&quot;string&quot;</code>',
        distractors: [
            '<code>&quot;number&quot;</code>',
            '<code>&quot;object&quot;</code>',
            'Nothing; it causes an error.'
        ]
    },
    {
        question: 'Which of the following is <em>NOT</em> a valid way to increment the variable <code>x</code>?',
        answer: '<code>Math.increaseBy1(x);</code>',
        distractors: [
            '<code>x += 1;</code>',
            '<code>x = x + 1;</code>',
            '<code>x += 1;</code>',
            '<code>++x;</code>',
            '<code>x++;</code>'
        ]
    },
    {
        question: 'How do you output a value to the browser console?',
        answer: '<code>console.log(<em>expression</em>)</code>',
        distractors: [
            '<code>print(<em>expression</em>)</code>',
            '<code>window.alert(<em>expression</em>)</code>',
            '<code>window.log(<em>expression</em>)</code>'
        ]
    },
    {
        question: 'What keyword declares a variable whose value cannot be changed through reassignment?',
        answer: '<code>const</code>',
        distractors: [
            '<code>let</code>',
            '<code>var</code>',
            '<code>frozen</code>'
        ]
    },
    {
        question: 'How many days did it take Brendan Eich to create Javascript in 1995?',
        answer: '10',
        distractors: [
            '1',
            '5',
            '100',
            '20'
        ]
    },
    {
        question: 'What symbol or keyword is used as the assignment operator in Javascript?',
        answer: '<code>=</code>',
        distractors: [
            '<code>:=</code>',
            '<code>==</code>',
            '<code>===</code>',
            '<code>&lt;-</code>'
        ]
    },
    {
        question: 'What does the function <code>setTimeout</code> do?',
        answer: 'Invokes a callback function after a given number of milliseconds have elapsed.',
        distractors: [
            'Unloads the webpage after a given number of milliseconds have elapsed.',
            'Halts the execution of JavaScript code after a given number of milliseconds have elapsed.',
            'Pauses execution of all JavaScript code for a given number of milliseconds.'
        ]
    }
];

//make sure that each question has 3 distractor answers
questions.forEach((questionData, index) => {
        console.assert(questionData.distractors.length >= 3, `Not enough distractors for question #${index}`);
    }
);

// Initialize variables to refer to main UI elements
const timerDiv = document.getElementById('timer');
const viewScoresDiv = document.getElementById('view-scores');

const welcomeSection = document.getElementById('welcome');
const beginButton = document.getElementById('begin-quiz');

const qAndASection = document.getElementById('q-and-a');
const questionH2 = document.getElementById('question');
const answerList = document.getElementById('answer-list');

const answerToLastQuestionSection = document.getElementById('answer-to-last-question');

const quizOverSection = document.getElementById('quiz-over');
const finalScoreSpan = document.getElementById('final-score');
const hsForm = document.querySelector('form');
const initialsInputBox = document.getElementById('initials');
const scoreSubmitButton = document.getElementById('initials-submit');
const inputErrorMsgP = document.getElementById('input-error-msg');


const highScoresSection = document.getElementById('highscores');
const highScoreList = document.getElementById('highscore-list');
const goBackButton = document.getElementById('go-back');
const clearScoresButton = document.getElementById('clear-scores');

// Constants to govern game mechanics
const INCORRECT_TIME_PENALTY = 10;
const TIME_PER_QUESTION = 10;
const POINTS_PER_CORRECT_ANSWER = 5;
const POINTS_PER_SECOND_REMAINING = 1;
const ANSWER_FEEDBACK_DISPLAY_LENGTH = 2000; // length of time to display message for whether previous answer was right or wrong

//global variables for game state (number correct, timer, etc.)
let timer = 0;
let timerInterval; // to hold return value from setInterval
let unpickedQuestions; // array to hold the indices of unpicked questions
let correctAnswers = 0;
let score; // computed at end of game
let answerToLastQuestionTimeout;

//Displays welcome page and sets the state to begin a new game
function showWelcome() {
    welcomeSection.className = '';
    qAndASection.className = 'hidden';
    answerToLastQuestionSection.className = 'hidden';
    highScoresSection.className = 'hidden';
    viewScoresDiv.className = '';
}

//Begins a quiz game
function playQuiz() {
    // initialize timer
    timer = TIME_PER_QUESTION * questions.length;
    timerInterval = setInterval(timerTick, 1000);
    displayTimer();

    // initialize correct answers
    correctAnswers = 0;
    
    // ititialize list of questions to answer by getting keys of all questions available and shuffling them
    unpickedQuestions = Array.from(questions.keys());
    shuffleArray(unpickedQuestions);

    // hide welcome message and show first question
    welcomeSection.className = 'hidden';
    displayQuestion();
}

//Picks a question at random and displays it or ends the game if all questions have been picked.
function displayQuestion() {
    //get next question 
    const nextQuestionIndex = unpickedQuestions.shift();
    //end the quiz if there are no more questions to ask 
    if (nextQuestionIndex === undefined) {
        endGameAndShowQuizResult();
        return;
    } else {
        const nextQuestion = questions[nextQuestionIndex];
        // construct sequence to show answers in
        answerOrder = Array.from(nextQuestion.distractors.keys());
        shuffleArray(answerOrder);
        answerOrder.splice(3); // truncate the list of distractors  
        answerOrder.splice(Math.floor(Math.random()*4), 0, -1); // insert -1 as the marker for the correct answer 

        // add question and answers as innerHTML to corresponding element objects
        questionH2.innerHTML = nextQuestion.question;
        for (let i = 0; i < 4; i++) {
            if (answerOrder[i] == -1) {
                answerList.children[i].innerHTML = nextQuestion.answer;
            } else {
                answerList.children[i].innerHTML = nextQuestion.distractors[answerOrder[i]];
            }
            answerList.children[i].dataset.answerIndex = answerOrder[i];
        }
    
        // make sure qAndASection is not hidden
        qAndASection.className = '';
    }
}

//Action for every tick (second) of the timer 
function timerTick() {
    timer--;
    if (timer <= 0) {
        endGameAndShowQuizResult();
    } else {
        displayTimer();
    }
}

//Shows & updates timer on screen for user to see
function displayTimer() {
    timerDiv.className = ''; // make sure the timer isn't hidden
    timerDiv.textContent = 'Time left: ' + timer;
}

//Ends the game and shows quiz results
function endGameAndShowQuizResult() {
    //stop the timer
    clearInterval(timerInterval);
    timerInterval = null;

    //compute score and display it
    if (correctAnswers === 0) {
        // no points if no answers were correct
        score = 0;
    } else {
        // 10 points for each correct answer plus extra points for number of seconds left on timer. 
        score = POINTS_PER_CORRECT_ANSWER * correctAnswers + 
                POINTS_PER_SECOND_REMAINING * Math.max(timer, 0);
    }

    // hide sections shown during game
    qAndASection.className = 'hidden';
    
    timerDiv.className = 'hidden';
    
    // display Quiz result screen
    finalScoreSpan.textContent = score;
    quizOverSection.className = '';
    
}

//Validates initials and registers high scores if necessary
function registerScore(event) {
    event.preventDefault();
    const initials = initialsInputBox.value.trim()

    // make sure that the user entered initials
    if (initials === '') {
        // show error message and exit
        inputErrorMsgP.textContent = 'You need to type at least one character for your initials.';
        return;
    } 

    
    let highScores = localStorage.getItem('scores');
    if (highScores === null) {
        highScores = [{'score': score, 'initials': initials}]; 
    } else {
        highScores = JSON.parse(highScores);
        highScores.push({'score': score, 'initials': initials});
        // keep high scores sorted in descending order
        highScores.sort((entryA, entryB) => entryB.score - entryA.score);
    }
    localStorage.setItem('scores', JSON.stringify(highScores));
    quizOverSection.className = 'hidden';
    showHighScores();
}

function showHighScores() {
    // hide link to jump to high scores
    viewScoresDiv.className = 'hidden';

    let highScores = localStorage.getItem('scores');
    if (highScores !== null) {
        highScores = JSON.parse(highScores);
        // remove any nodes from highScores
        highScoreList.innerHTML = '';
        // populate list from scores retrieved from local storage
        for (const entry of highScores) {
            const entryLi = document.createElement('li');
            entryLi.textContent = `${entry.initials}: ${entry.score}`
            highScoreList.appendChild(entryLi);
        }
    }

    // display section
    highScoresSection.className = '';
}

function jumpToHighScores() {
    if (welcomeSection.className !== 'hidden') {
        welcomeSection.className = 'hidden';
        showHighScores();
    } else if (qAndASection.className !== 'hidden') {
        if (window.confirm('Going to the high scores will end your current game.\n' +
                           'Do you still want to go to the high scores?')) {
            clearInterval(timerInterval);
            timerDiv.className = 'hidden';
            qAndASection.className = 'hidden';
            showHighScores();
        }
    } else if (quizOverSection.className !== 'hidden') {
        if (window.confirm('This will discard your score from the last game.\n' +
                           'Do you want to go to the high scores without registering the latest score?')) {
            quizOverSection.className = 'hidden';
            showHighScores();
        }
    }
}

function clearScores() {
    highScoreList.innerHTML = '';
    localStorage.removeItem('scores');
}

// check question answer
function checkQuestionAnswer(event) {
    let answerLi;
    if (event.target.tagName.toLowerCase() === 'li') {
        answerLi = event.target
    } else if (event.target.matches('#answer-list>li *')) { 
        answerLi = event.target.parentElement;
        while (answerLi.tagName.toLowerCase() !== 'li') answerLi = answerLi.parentElement;
    } else {
       // Click was not on one of the answers, so do nothing
       return; 
    }

    event.stopPropagation();
    if (answerLi.dataset.answerIndex == '-1') {
        // user answered correctly
        correctAnswers++;
        answerToLastQuestionSection.textContent = 'Correct!';
    } else {
        // user answered incorrectly
        answerToLastQuestionSection.textContent = `Wrong answer! You lose ${INCORRECT_TIME_PENALTY} seconds!`;
        timer -= INCORRECT_TIME_PENALTY;
    }
    // clear timeout for the result from the previous question, if it exists
    if (answerToLastQuestionTimeout) {
        clearTimeout(answerToLastQuestionTimeout);
    }
    // show result from this question for 2 seconds
    answerToLastQuestionSection.className = '';
    answerToLastQuestionTimeout = setTimeout(() => {
        answerToLastQuestionSection.className = 'hidden';
    }, ANSWER_FEEDBACK_DISPLAY_LENGTH);
    // display the next question
    displayQuestion();
}

// Shuffles an array in place suing the Fisher-Yates shuffle algorithm
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Picks an element from an array-like object at random
function randomChoice(arrayLike) {
    return Math.floor(Math.random() * arrayLike.length);
}

beginButton.addEventListener('click', playQuiz);
goBackButton.addEventListener('click', showWelcome);
clearScoresButton.addEventListener('click', clearScores);
answerList.addEventListener('click', checkQuestionAnswer);
scoreSubmitButton.addEventListener('click', registerScore);
viewScoresDiv.addEventListener('click', jumpToHighScores);

showWelcome();