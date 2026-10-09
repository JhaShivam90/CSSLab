document.addEventListener('DOMContentLoaded', () => {
    // --- Sample Data ---
    const samples = {
        "1": {
            ciphertext: "WKLV LV D VLPSOH PHVVDJH. LW XVHV D VWDQGDUG FDHVDU VKLIW.",
            plaintext: "THIS IS A SIMPLE MESSAGE. IT USES A STANDARD CAESAR SHIFT.",
            mapping: { 'W':'T', 'K':'H', 'L':'I', 'V':'S', 'D':'A', 'P':'M', 'H':'E', 'Q':'N', 'G':'D', 'F':'C', 'O':'L', 'J':'G', 'X':'U', 'R':'O', 'Z':'W', 'S':'P', 'I':'F', 'B':'Y', 'C':'Z', 'M':'J', 'A':'X', 'E':'B', 'N':'K', 'T':'Q', 'Y':'V', 'U':'R' } 
            // WKLV LV D VLPSOH PHVVDJH LW XVHV D VWDQGDUG FDHVDU VKLIW
            // THIS IS A SIMPLE MESSAGE IT USES A STANDARD CAESAR SHIFT
            // We just need a subset to check the answer
        },
        "2": {
            // "CRYPTOGRAPHY IS THE PRACTICE AND STUDY OF TECHNIQUES FOR SECURE COMMUNICATION"
            ciphertext: "XOBKQLDOXMEV FP QEB MOXZQFZB XKA PQRAV LC QEZEKFNRBP CLO PBZROB ZLJJRKFZXQFLK",
            plaintext: "CRYPTOGRAPHY IS THE PRACTICE AND STUDY OF TECHNIQUES FOR SECURE COMMUNICATION",
            mapping: {} // calculated dynamically below
        }
    };

    // Calculate mapping for sample 2 dynamically based on shift -3 (which maps 'X' to 'C')
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for(let i = 0; i < alphabet.length; i++) {
        let plainChar = alphabet[i];
        let cipherChar = alphabet[(i + 23) % 26]; // -3 shift
        samples["2"].mapping[cipherChar] = plainChar;
    }
    
    // For sample 1, standard shift +3 (A->D) -> D is mapped to A
    samples["1"].mapping = {};
    for(let i = 0; i < alphabet.length; i++) {
        let plainChar = alphabet[i];
        let cipherChar = alphabet[(i + 3) % 26];
        samples["1"].mapping[cipherChar] = plainChar;
    }

    // --- DOM Elements ---
    const sampleSelector = document.getElementById('sample-selector');
    const ciphertextInput = document.getElementById('ciphertext');
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnReset = document.getElementById('btn-reset');
    const analysisSection = document.getElementById('analysis-section');
    
    const chartContainer = document.getElementById('chart-container');
    const freqTableHead = document.getElementById('freq-table-head');
    const freqTableCount = document.getElementById('freq-table-count');
    const freqTablePercent = document.getElementById('freq-table-percent');
    
    const mappingContainer = document.getElementById('mapping-container');
    const btnApplyMapping = document.getElementById('btn-apply-mapping');
    const btnCheckAnswer = document.getElementById('btn-check-answer');
    const btnHint = document.getElementById('btn-hint');
    const hintBox = document.getElementById('hint-box');
    const verificationBox = document.getElementById('verification-box');
    const decryptedOutput = document.getElementById('decrypted-output');

    let currentFreqData = [];
    let currentTotalAlpha = 0;
    let hintLevel = 0;
    let currentMappingInputs = {};

    // --- Initialization ---
    function init() {
        sampleSelector.addEventListener('change', handleSampleChange);
        btnAnalyze.addEventListener('click', analyzeFrequency);
        btnReset.addEventListener('click', resetSimulation);
        btnApplyMapping.addEventListener('click', applyMapping);
        btnCheckAnswer.addEventListener('click', checkAnswer);
        btnHint.addEventListener('click', showHint);
        
        initQuiz();
    }

    // --- Core Functions ---
    function handleSampleChange() {
        const val = sampleSelector.value;
        if (val && samples[val]) {
            ciphertextInput.value = samples[val].ciphertext;
        } else {
            ciphertextInput.value = "";
        }
    }

    function analyzeFrequency() {
        const text = ciphertextInput.value.toUpperCase();
        if (!text.trim()) {
            alert("Please enter some ciphertext to analyze.");
            return;
        }

        const counts = {};
        let totalAlpha = 0;
        
        for (let i = 0; i < 26; i++) {
            counts[String.fromCharCode(65 + i)] = 0;
        }

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char >= 'A' && char <= 'Z') {
                counts[char]++;
                totalAlpha++;
            }
        }

        if (totalAlpha === 0) {
            alert("No alphabetic characters found to analyze.");
            return;
        }

        currentTotalAlpha = totalAlpha;
        
        // Convert to array and sort alphabetically first
        let data = Object.keys(counts).map(char => ({
            char: char,
            count: counts[char],
            percent: ((counts[char] / totalAlpha) * 100).toFixed(2)
        }));

        currentFreqData = [...data];

        renderChart(data);
        renderTable(data);
        renderMappingWorkspace(data);
        
        // Initialize output preview with unmapped text
        applyMapping();

        analysisSection.style.display = 'block';
        hintLevel = 0;
        hintBox.style.display = 'none';
        verificationBox.style.display = 'none';
        
        if (sampleSelector.value) {
            btnCheckAnswer.style.display = 'inline-block';
        } else {
            btnCheckAnswer.style.display = 'none';
        }
    }

    function renderChart(data) {
        chartContainer.innerHTML = '';
        const maxPercent = Math.max(...data.map(d => parseFloat(d.percent)), 13); // min 13% for scale

        data.forEach(item => {
            const heightPercent = (parseFloat(item.percent) / maxPercent) * 100;
            
            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';
            
            const barValue = document.createElement('div');
            barValue.className = 'bar-value';
            barValue.textContent = item.percent + '%';
            
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = heightPercent + '%';
            
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = item.char;
            
            barContainer.appendChild(barValue);
            barContainer.appendChild(bar);
            barContainer.appendChild(label);
            chartContainer.appendChild(barContainer);
        });
    }

    function renderTable(data) {
        // Sort data by frequency descending for the table
        const sortedData = [...data].sort((a, b) => b.count - a.count);
        
        freqTableHead.innerHTML = '<th>Letter</th>';
        freqTableCount.innerHTML = '<th>Count</th>';
        freqTablePercent.innerHTML = '<th>%</th>';
        
        sortedData.forEach(item => {
            freqTableHead.innerHTML += `<th>${item.char}</th>`;
            freqTableCount.innerHTML += `<td>${item.count}</td>`;
            freqTablePercent.innerHTML += `<td>${item.percent}</td>`;
        });
    }

    function renderMappingWorkspace(data) {
        mappingContainer.innerHTML = '';
        currentMappingInputs = {};
        
        // Sort alphabetically for mapping workspace
        data.forEach(item => {
            const wrap = document.createElement('div');
            wrap.className = 'mapping-item';
            
            const label = document.createElement('span');
            label.textContent = item.char;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.cipher = item.char;
            
            currentMappingInputs[item.char] = input;
            
            wrap.appendChild(label);
            wrap.appendChild(input);
            mappingContainer.appendChild(wrap);
        });
    }

    function applyMapping() {
        const text = ciphertextInput.value.toUpperCase();
        let mappedTextHTML = "";
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char >= 'A' && char <= 'Z') {
                const input = currentMappingInputs[char];
                const mappedVal = input && input.value ? input.value.toUpperCase() : null;
                
                if (mappedVal && mappedVal >= 'A' && mappedVal <= 'Z') {
                    mappedTextHTML += `<span class="output-char-mapped">${mappedVal.toLowerCase()}</span>`;
                } else {
                    mappedTextHTML += `<span class="output-char-unmapped">${char}</span>`;
                }
            } else {
                mappedTextHTML += `<span class="output-char-unmapped">${char}</span>`;
            }
        }
        
        decryptedOutput.innerHTML = mappedTextHTML;
        verificationBox.style.display = 'none';
    }

    function checkAnswer() {
        const sampleId = sampleSelector.value;
        if (!sampleId || !samples[sampleId]) return;
        
        const expectedMapping = samples[sampleId].mapping;
        let isCorrect = true;
        let filledCount = 0;
        let incorrectCount = 0;
        
        for (let cipherChar in currentMappingInputs) {
            const mappedVal = currentMappingInputs[cipherChar].value.toUpperCase();
            if (mappedVal) {
                filledCount++;
                if (expectedMapping[cipherChar] !== mappedVal) {
                    isCorrect = false;
                    incorrectCount++;
                }
            }
        }
        
        verificationBox.className = 'alert-box';
        
        if (filledCount === 0) {
            verificationBox.textContent = "Please enter some mappings before checking.";
            verificationBox.classList.add('info');
        } else if (isCorrect) {
            if (filledCount >= Object.keys(expectedMapping).length || filledCount > 10) {
                 verificationBox.textContent = "Excellent work! Your mappings are correct and you've successfully decrypted the message.";
            } else {
                 verificationBox.textContent = "Good start! The mappings you've entered so far are correct. Keep going.";
            }
            verificationBox.classList.add('success');
        } else {
            verificationBox.textContent = `Some mappings are incorrect (${incorrectCount} incorrect out of ${filledCount} entered). Review your frequency analysis.`;
            verificationBox.classList.add('error');
        }
        verificationBox.style.display = 'block';
    }

    function showHint() {
        hintLevel++;
        hintBox.style.display = 'block';
        
        const sorted = [...currentFreqData].sort((a, b) => b.count - a.count);
        const mostFreq = sorted[0].char;
        
        if (hintLevel === 1) {
            hintBox.textContent = `Hint 1: The most frequent letter in your ciphertext is '${mostFreq}'. In English, the most frequent letter is usually 'E'. Try mapping '${mostFreq}' to 'E'.`;
        } else if (hintLevel === 2) {
            hintBox.textContent = `Hint 2: Look at small common words like "THE", "IS", "AND". After mapping 'E', look for patterns. For example, if you see a 3-letter word ending in 'e', it might be "the".`;
        } else {
            hintBox.textContent = `Hint 3: The second most common English letters are 'T', 'A', 'O', 'I'. Compare the top 4-5 letters in the Ciphertext Frequency Table with the English Reference table.`;
            hintLevel = 0; // reset hint loop
        }
    }

    function resetSimulation() {
        ciphertextInput.value = '';
        sampleSelector.value = '';
        analysisSection.style.display = 'none';
        hintLevel = 0;
        hintBox.style.display = 'none';
        verificationBox.style.display = 'none';
    }

    // --- Quiz Logic ---
    const quizData = [
        {
            question: "What is frequency analysis in cryptography?",
            options: [
                "A method of guessing passwords quickly.",
                "The study of how often letters or groups of letters appear in ciphertext.",
                "A mathematical formula to generate prime numbers.",
                "Encrypting data multiple times."
            ],
            correct: 1
        },
        {
            question: "Which English letter is typically the most frequent?",
            options: ["A", "T", "E", "O"],
            correct: 2
        },
        {
            question: "Frequency analysis is most effective against which type of cipher?",
            options: [
                "Monoalphabetic substitution cipher",
                "Polyalphabetic substitution cipher (like Vigenère)",
                "One-time pad",
                "Advanced Encryption Standard (AES)"
            ],
            correct: 0
        },
        {
            question: "Why might frequency analysis fail on a very short ciphertext?",
            options: [
                "Short ciphertexts don't use substitution.",
                "The letter distribution in a short text may not match standard language statistics.",
                "The alphabet changes dynamically in short texts.",
                "It takes too much computational power to analyze short texts."
            ],
            correct: 1
        },
        {
            question: "If the letter 'Q' appears 15% of the time in a ciphertext, it is most likely a substitute for:",
            options: ["Z", "Q", "E", "X"],
            correct: 2
        }
    ];

    function initQuiz() {
        const container = document.getElementById('quiz-container');
        container.innerHTML = '';
        
        quizData.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'quiz-question';
            
            const qText = document.createElement('p');
            qText.innerHTML = `<span>${index + 1}.</span> ${q.question}`;
            qDiv.appendChild(qText);
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-options';
            
            q.options.forEach((opt, optIndex) => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `quiz-${index}`;
                radio.value = optIndex;
                
                const optionText = document.createElement('span');
                optionText.textContent = opt;
                
                label.appendChild(radio);
                label.appendChild(optionText);
                optionsDiv.appendChild(label);
            });
            
            qDiv.appendChild(optionsDiv);
            container.appendChild(qDiv);
        });

        document.getElementById('btn-submit-quiz').addEventListener('click', submitQuiz);
        document.getElementById('btn-retry-quiz').addEventListener('click', retryQuiz);
    }

    function submitQuiz() {
        let score = 0;
        let allAnswered = true;
        
        quizData.forEach((q, index) => {
            const selected = document.querySelector(`input[name="quiz-${index}"]:checked`);
            if (selected) {
                if (parseInt(selected.value) === q.correct) {
                    score++;
                }
            } else {
                allAnswered = false;
            }
        });
        
        const resultBox = document.getElementById('quiz-result');
        
        if (!allAnswered) {
            resultBox.textContent = "Please answer all questions before submitting.";
            resultBox.className = 'alert-box info';
            resultBox.style.display = 'block';
            return;
        }
        
        resultBox.innerHTML = `You scored ${score} out of ${quizData.length}.<br>`;
        if (score === quizData.length) {
            resultBox.innerHTML += "Excellent! You understand the concepts perfectly.";
            resultBox.className = 'alert-box success';
        } else {
            resultBox.innerHTML += "Review the theory section and try again.";
            resultBox.className = 'alert-box error';
        }
        resultBox.style.display = 'block';
        
        document.getElementById('btn-submit-quiz').style.display = 'none';
        document.getElementById('btn-retry-quiz').style.display = 'inline-block';
        
        // Disable inputs
        const radios = document.querySelectorAll('#quiz-container input[type="radio"]');
        radios.forEach(r => r.disabled = true);
    }

    function retryQuiz() {
        const radios = document.querySelectorAll('#quiz-container input[type="radio"]');
        radios.forEach(r => {
            r.checked = false;
            r.disabled = false;
        });
        
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('btn-submit-quiz').style.display = 'inline-block';
        document.getElementById('btn-retry-quiz').style.display = 'none';
    }

    // Start
    init();
});
