let allData = [], quizData = [], current = 0, score = 0, timer;
const usernameEl   = document.getElementById('username');
const categoryEl   = document.getElementById('category-select');
const startBtn     = document.getElementById('start-btn');
const restartBtn   = document.getElementById('restart-btn');
const startScreen  = document.getElementById('start-screen');
const quizScreen   = document.getElementById('quiz-screen');
const endScreen    = document.getElementById('end-screen');
const questionEl   = document.getElementById('question');
const choicesEl    = document.getElementById('choices');
const nextBtn      = document.getElementById('next-btn');
const resultEl     = document.getElementById('result');
const currNumEl    = document.getElementById('current-num');
const totalNumEl   = document.getElementById('total-num');
const timeEl       = document.getElementById('time');
const finalScoreEl = document.getElementById('final-score');
const boardEl      = document.getElementById('leaderboard');

const chapterEl = document.getElementById('chapter-select');

// Load questions & populate category and chapter dropdowns
fetch('questions.json')
  .then(r => r.json())
  .then(data => {
    allData = data;
    const cats = Array.from(new Set(data.map(q => q.category)));
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = o.textContent = c;
      categoryEl.append(o);
    });
    const chapters = Array.from(new Set(data.map(q => q.chapter)));
    chapters.forEach(ch => {
      const o = document.createElement('option');
      o.value = o.textContent = ch;
      chapterEl.append(o);
    });
  });

// START QUIZ
startBtn.addEventListener('click', () => {
  const name = usernameEl.value.trim();
  if (!name) return alert('Please enter your name');
  const cat = categoryEl.value;
  const ch  = chapterEl.value;
  quizData = allData.filter(q =>
    (cat === 'all' || q.category === cat) &&
    (ch === 'all' || q.chapter === ch)
  );
  current = 0; score = 0;
  totalNumEl.textContent = quizData.length;
  startScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  loadQuestion();
});

// LOAD & DISPLAY A QUESTION
function loadQuestion() {
  clearInterval(timer);
  resetState();
  currNumEl.textContent = current + 1;
  const q = quizData[current];
  questionEl.textContent = q.question;
  q.choices.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    li.addEventListener('click', () => answerSelect(li));
    choicesEl.append(li);
  });
  startTimer();
}

// TIMER
function startTimer() {
  let time = 15;
  timeEl.textContent = time;
  timer = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) {
      clearInterval(timer);
      answerSelect(null);
    }
  }, 1000);
}

// RESET UI
function resetState() {
  nextBtn.disabled = true;
  resultEl.textContent = '';
  choicesEl.innerHTML = '';
}

// WHEN USER PICKS
function answerSelect(selectedEl) {
  clearInterval(timer);
  nextBtn.disabled = false;
  const correct = quizData[current].correct;
  const picked  = selectedEl?.textContent;
  if (picked === correct) {
    score++;
    resultEl.textContent = 'Correct!';
    resultEl.style.color = '#27ae60';
  } else {
    resultEl.textContent = `Wrong! Answer: ${correct}`;
    resultEl.style.color = '#c0392b';
    if (selectedEl) {
      selectedEl.classList.add('wrong');
      setTimeout(() => selectedEl.classList.remove('wrong'), 400);
    }
  }
}

// NEXT BUTTON
nextBtn.addEventListener('click', () => {
  current++;
  if (current < quizData.length) {
    loadQuestion();
  } else {
    showEndScreen();
  }
});

// END & LEADERBOARD
function showEndScreen() {
  quizScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');

  const name = usernameEl.value.trim();
  finalScoreEl.textContent = `${name}, you scored ${score}/${quizData.length}`;

  // Save & sort leaderboard
 // const board = JSON.parse(localStorage.getItem('leaderboard') || '[]');
 // board.push({ name, score, date: Date.now() });
 // board.sort((a,b) => b.score - a.score);
 // localStorage.setItem('leaderboard', JSON.stringify(board.slice(0,5)));

  // Display top 5
  board.slice(0,5).forEach(entry => {
    const li = document.createElement('li');
    const d  = new Date(entry.date).toLocaleDateString();
    li.textContent = `${entry.name}: ${entry.score} (${d})`;
    boardEl.append(li);
  });

  // Confetti if perfect
  if (score === quizData.length) {
    confetti({ spread: 70, particleCount: 200 });
  }
}

// RESTART QUIZ
restartBtn.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  boardEl.innerHTML = '';
});

