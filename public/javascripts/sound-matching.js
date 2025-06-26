const playBtn = document.getElementById("play-sound");
const sound = document.getElementById("sound");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

let currentLevel = 0;
let soundPlayed = false;
let score = 0;

const levels = [
  {
    sound: "/audio/haroof/bay.wav",
    options: [
      { image: "/images/goat.png", label: "بکری", correct: true },
      { image: "/images/tree.webp", label: "درخت", correct: false },
      { image: "/images/book.avif", label: "کتاب", correct: false }
    ]
  },
  {
    sound: "/audio/haroof/alif.wav",
    options: [
      { image: "/images/pomegranate.jpg", label: "انار", correct: true },
      { image: "/images/car.jpg", label: "گاڑی", correct: false },
      { image: "/images/fish.jpg", label: "مچھلی", correct: false }
    ]
  },
  {
    sound: "/audio/haroof/jeem.wav",
    options: [
      { image: "/images/boat.avif", label: "جہاز", correct: true },
      { image: "/images/dog.png", label: "کتا", correct: false },
      { image: "/images/lion.png", label: "شیر", correct: false }
    ]
  },
  {
    sound: "/audio/haroof/daal.wav",
    options: [
      { image: "/images/heart.jpg", label: "دل", correct: true },
      { image: "/images/apple.jpg", label: "سیب", correct: false },
      { image: "/images/sun.png", label: "سورج", correct: false }
    ]
  },
  {
    sound: "/audio/haroof/seen.wav",
    options: [
      { image: "/images/snake.jpg", label: "سانپ", correct: true },
      { image: "/images/book.avif", label: "کتاب", correct: false },
      { image: "/images/banana.png", label: "کیلا", correct: false }
    ]
  }
];


function loadLevel(index) {
  const level = levels[index];
  sound.src = level.sound;
  soundPlayed = false;
  feedback.textContent = "";
  nextBtn.style.display = "none";

  optionsContainer.innerHTML = "";
  level.options.forEach(option => {
    const div = document.createElement("div");
    div.classList.add("option", "disabled");
    div.setAttribute("data-answer", option.correct);
    div.innerHTML = `<img src="${option.image}" alt="${option.label}" />
                     <p>${option.label}</p>`;
    optionsContainer.appendChild(div);
  });

  addOptionListeners();
}

playBtn.addEventListener("click", () => {
  sound.play().then(() => {
    soundPlayed = true;
    document.querySelectorAll(".option").forEach(option => {
      option.classList.remove("disabled");
    });
    feedback.textContent = "";
  }).catch(err => {
    console.error("Sound failed to play:", err);
  });
});
function addOptionListeners() {
  const options = document.querySelectorAll(".option");
  options.forEach(option => {
    option.addEventListener("click", () => {
      if (!soundPlayed || option.classList.contains("disabled")) {
        feedback.textContent = "پہلے آواز سنیں 🔊";
        feedback.style.color = "orange";
        return;
      }

      const isCorrect = option.getAttribute("data-answer") === "true";
      if (isCorrect) {
        feedback.textContent = "✅ شاباش! درست جواب";
        feedback.style.color = "green";
        score++;
      } else {
        feedback.textContent = "❌ درست جواب نہیں";
        feedback.style.color = "red";
      }

      // Disable all options after selection
      options.forEach(o => o.classList.add("disabled"));

      // Auto move to next level after delay
      setTimeout(() => {
        currentLevel++;
        if (currentLevel < levels.length) {
          loadLevel(currentLevel);
        } else {
          showFinalScreen();
        }
      }, 1500); 
    });
  });
}


nextBtn.addEventListener("click", () => {
  currentLevel++;
  if (currentLevel < levels.length) {
    loadLevel(currentLevel);
  } else {
    showFinalScreen();
  }
});

restartBtn.addEventListener("click", () => {
  // Reset game
  currentLevel = 0;
  score = 0;
  playBtn.disabled = false;
  restartBtn.style.display = "none";
  loadLevel(currentLevel);
});

function showFinalScreen() {
  optionsContainer.innerHTML = "";
  feedback.innerHTML = `🎉 آپ نے ${levels.length} میں سے ${score} درست جوابات دیے!`;
  feedback.style.color = "blue";
  nextBtn.style.display = "none";
  playBtn.disabled = true;
  restartBtn.style.display = "inline-block";
}

// Load first level
loadLevel(currentLevel);
