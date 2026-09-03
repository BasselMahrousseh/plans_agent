const questions = [
    {
      text: "Do you want the cheapest monthly plan?",
      tag: "cheap"
    },
    {
      text: "Do you need unlimited local data?",
      tag: "unlimitedData"
    },
    {
      text: "Do you care about the fastest speed?",
      tag: "fastSpeed"
    },
    {
      text: "Do you call local numbers a lot?",
      tag: "localMinutes"
    },
    {
      text: "Do you need international or flexi minutes?",
      tag: "flexiMinutes"
    },
    {
      text: "Do you need roaming data?",
      tag: "roaming"
    },
    {
      text: "Do you prefer a 12-month commitment?",
      tag: "shortCommitment"
    },
    {
      text: "Do you want subscriptions like Smiles, Go, or Starzplay?",
      tag: "subscriptions"
    }
  ];

  const plans = [
    {
      name: "New Freedom Non-Stop Data Plan 250 Local",
      price: 188,
      speed: "Up to 3Mbps",
      data: "Non-Stop",
      minutes: "1000 local minutes",
      roaming: "200MB",
      commitment: "12 months",
      features: ["cheap", "localMinutes", "shortCommitment"]
    },
    {
      name: "New Freedom Non-Stop Data Plan 250 Flexi",
      price: 188,
      speed: "Up to 3Mbps",
      data: "Non-Stop",
      minutes: "500 flexi minutes",
      roaming: "200MB",
      commitment: "12 months",
      features: ["cheap", "flexiMinutes", "shortCommitment"]
    },
    {
      name: "New Freedom Non-Stop Data Plan 325 Local",
      price: 228,
      speed: "Up to 10Mbps",
      data: "Non-Stop",
      minutes: "1800 local minutes",
      roaming: "1GB",
      commitment: "12 months",
      features: ["localMinutes", "roaming", "shortCommitment", "subscriptions"]
    },
    {
      name: "New Freedom Non-Stop Data Plan 325 Flexi",
      price: 228,
      speed: "Up to 10Mbps",
      data: "Non-Stop",
      minutes: "900 flexi minutes",
      roaming: "1GB",
      commitment: "12 months",
      features: ["flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
    },
    {
      name: "New Freedom Non-Stop Data Plan 375 Local",
      price: 263,
      speed: "Up to 50Mbps",
      data: "Non-Stop",
      minutes: "2200 local minutes",
      roaming: "5GB",
      commitment: "12 months",
      features: ["fastSpeed", "localMinutes", "roaming", "shortCommitment", "subscriptions"]
    },
    {
      name: "New Freedom Non-Stop Data Plan 375 Flexi",
      price: 263,
      speed: "Up to 50Mbps",
      data: "Non-Stop",
      minutes: "1100 flexi minutes",
      roaming: "5GB",
      commitment: "12 months",
      features: ["fastSpeed", "flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
    },
    {
      name: "New Freedom Unlimited Data Plan 500 Local",
      price: 300,
      speed: "Unlimited at max speeds",
      data: "Unlimited local data",
      minutes: "3000 local minutes",
      roaming: "10GB",
      commitment: "12 months",
      features: ["unlimitedData", "fastSpeed", "localMinutes", "roaming", "shortCommitment", "subscriptions"]
    },
    {
      name: "New Freedom Unlimited Data Plan 500 Flexi",
      price: 300,
      speed: "Unlimited at max speeds",
      data: "Unlimited local data",
      minutes: "1500 flexi minutes",
      roaming: "10GB",
      commitment: "12 months",
      features: ["unlimitedData", "fastSpeed", "flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
    },
    {
      name: "Gold Plan 500 Local",
      price: 500,
      speed: "Standard Gold plan",
      data: "100GB local data",
      minutes: "Unlimited local minutes",
      roaming: "Not shown",
      commitment: "24 months",
      features: ["localMinutes"]
    },
    {
      name: "Gold Plan 500 Flexi",
      price: 500,
      speed: "Standard Gold plan",
      data: "100GB local data",
      minutes: "3500 flexi minutes",
      roaming: "Not shown",
      commitment: "24 months",
      features: ["flexiMinutes"]
    }
  ];

  let currentQuestion = 0;
  let answers = [];

  const card = document.getElementById("card");
  const questionText = document.getElementById("question");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const result = document.getElementById("result");

  showQuestion();

  yesBtn.addEventListener("click", () => handleAnswer(true));
  noBtn.addEventListener("click", () => handleAnswer(false));

  function showQuestion() {
    if (currentQuestion >= questions.length) {
      showResult();
      return;
    }

    questionText.textContent = questions[currentQuestion].text;
  }

  function handleAnswer(answer) {
    const currentTag = questions[currentQuestion].tag;

    if (answer) {
      answers.push(currentTag);
      card.classList.add("swipe-right");
    } else {
      card.classList.add("swipe-left");
    }

    setTimeout(() => {
      card.classList.remove("swipe-right");
      card.classList.remove("swipe-left");

      currentQuestion++;
      showQuestion();
    }, 350);
  }

  function showResult() {
    card.style.display = "none";
    yesBtn.style.display = "none";
    noBtn.style.display = "none";

    let bestPlan = null;
    let bestScore = -1;

    for (let plan of plans) {
      let score = 0;

      for (let answer of answers) {
        if (plan.features.includes(answer)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestPlan = plan;
      }
    }

    result.classList.remove("hidden");

    result.innerHTML = `
      <h2>Your Best Match</h2>
      <h3>${bestPlan.name}</h3>
      <p><strong>Price:</strong> AED ${bestPlan.price}/month + VAT</p>
      <p><strong>Speed:</strong> ${bestPlan.speed}</p>
      <p><strong>Data:</strong> ${bestPlan.data}</p>
      <p><strong>Minutes:</strong> ${bestPlan.minutes}</p>
      <p><strong>Roaming:</strong> ${bestPlan.roaming}</p>
      <p><strong>Commitment:</strong> ${bestPlan.commitment}</p>
      <p><strong>Why this plan?</strong> It matched ${bestScore} of your preferences.</p>
      <button onclick="restartQuiz()">Start Over</button>
    `;
  }

  function restartQuiz() {
    currentQuestion = 0;
    answers = [];

    card.style.display = "flex";
    yesBtn.style.display = "block";
    noBtn.style.display = "block";
    result.classList.add("hidden");

    showQuestion();
  }