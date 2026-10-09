document.addEventListener('DOMContentLoaded', () => {
    // --- Sample Data ---
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Builds a cipher->plain lookup for a Caesar shift (cipher = plain + shift)
function caesarMapping(shift) {
    const m = {};
    for (let i = 0; i < 26; i++) {
        m[alphabet[(i + shift + 26) % 26]] = alphabet[i];
    }
    return m;
}

const samples = {
    "1": {
        ciphertext: "WKLV LV D VLPSOH PHVVDJH. LW XVHV D VWDQGDUG FDHVDU VKLIW.",
        plaintext: "THIS IS A SIMPLE MESSAGE. IT USES A STANDARD CAESAR SHIFT.",
        mapping: caesarMapping(3)    // shift +3
    },
    "2": {
        ciphertext: "ZOVMQLDOXMEV FP QEB MOXZQFZB XKA PQRAV LC QBZEKFNRBP CLO PBZROB ZLJJRKFZXQFLK",
        plaintext: "CRYPTOGRAPHY IS THE PRACTICE AND STUDY OF TECHNIQUES FOR SECURE COMMUNICATION",
        mapping: caesarMapping(-3)   // shift -3
    }
};
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
    const btnAutoSolve = document.getElementById('btn-autosolve');

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
        btnAutoSolve.addEventListener('click', autoSolve);
        
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

    // --- Auto-Solve (frequency start + hill-climbing on English n-gram score) ---
    // --- Auto-Solve (frequency start + hill-climbing on English n-gram score) ---
    const ENGLISH_ORDER = "ETAOINSHRDLCUMWFGYPBVKJXQZ";
    const COMMON_BIGRAMS = new Set("TH HE IN ER AN RE ON AT EN ND TI ES OR TE OF ED IS IT AL AR ST TO NT NG SE HA AS OU IO LE VE CO ME DE HI RI RO IC NE EA RA CE LI CH LL BE MA SI OM UR".split(" "));
    const COMMON_TRIGRAMS = new Set("THE AND ING ENT ION HER FOR THA NTH INT ERE TIO TER EST ERS ATI HAT ATE ALL ETH HES VER HIS OFT ITH FTH STH OTH RES ONT".split(" "));
    const COMMON_WORDS = new Set("THE AND OF TO A IN IS THAT IT FOR AS WITH WAS ON BE BY AT THIS ARE FROM OR AN HAVE NOT BUT WE YOU ALL CAN HER HIS THEY WILL ONE WHICH THERE THEIR HAS BEEN IF MORE WHEN WHO SO NO USE USES".split(" "));

    function scoreText(plain) {
        let score = 0;
        const words = plain.split(/[^A-Z]+/);
        for (const w of words) {
            if (!w) continue;
            if (COMMON_WORDS.has(w)) score += 2 * w.length;
            for (let i = 0; i + 1 < w.length; i++) {
                if (COMMON_BIGRAMS.has(w.substr(i, 2))) score += 1;
                if (i + 2 < w.length && COMMON_TRIGRAMS.has(w.substr(i, 3))) score += 3;
            }
        }
        return score;
    }

    function solveSubstitution(cipher) {
        const counts = Array(26).fill(0);
        for (const ch of cipher) {
            if (ch >= 'A' && ch <= 'Z') counts[ch.charCodeAt(0) - 65]++;
        }

        const order = [...Array(26).keys()].sort((a, b) => counts[b] - counts[a]);
        const startKey = Array(26);
        order.forEach((cipherIdx, rank) => { startKey[cipherIdx] = ENGLISH_ORDER[rank]; });

        const decrypt = k => cipher.replace(/[A-Z]/g, ch => k[ch.charCodeAt(0) - 65]);

        function climb(k) {
            let best = scoreText(decrypt(k));
            let improved = true;
            while (improved) {
                improved = false;
                for (let i = 0; i < 26; i++) {
                    for (let j = i + 1; j < 26; j++) {
                        [k[i], k[j]] = [k[j], k[i]];
                        const s = scoreText(decrypt(k));
                        if (s > best) { best = s; improved = true; }
                        else { [k[i], k[j]] = [k[j], k[i]]; }
                    }
                }
            }
            return best;
        }

        let bestKey = startKey.slice();
        let bestScore = climb(bestKey);

        for (let r = 0; r < 15; r++) {
            const k = bestKey.slice();
            for (let t = 0; t < 4; t++) {
                const a = Math.floor(Math.random() * 26);
                const b = Math.floor(Math.random() * 26);
                [k[a], k[b]] = [k[b], k[a]];
            }
            const s = climb(k);
            if (s > bestScore) { bestScore = s; bestKey = k; }
        }
        return bestKey;
    }

    // --- Word-pattern solver (better for short ciphertexts) ---
    const WORD_LIST = ("THE OF AND TO A IN IS THAT IT FOR AS WITH WAS ON BE BY AT THIS ARE FROM OR AN HAVE NOT BUT " +
      "WE YOU ALL CAN HER HIS THEY WILL ONE WHICH THERE THEIR HAS BEEN IF MORE WHEN WHO SO NO I USE USES USED " +
      "WHAT YOUR SAID EACH SHE HOW OTHER WORDS MANY THEN THEM THESE SOME HER WOULD MAKE LIKE HIM INTO TIME LOOK " +
      "TWO MORE WRITE GO SEE NUMBER WAY COULD PEOPLE MY THAN FIRST WATER BEEN CALL OIL NOW FIND LONG DOWN DAY DID " +
      "GET COME MADE MAY PART OVER NEW SOUND TAKE ONLY LITTLE WORK KNOW PLACE YEAR LIVE ME BACK GIVE MOST VERY AFTER " +
      "THING OUR JUST NAME GOOD SENTENCE MAN THINK SAY GREAT WHERE HELP THROUGH MUCH BEFORE LINE RIGHT TOO MEAN OLD " +
      "ANY SAME TELL BOY FOLLOW CAME WANT SHOW ALSO AROUND FORM THREE SMALL SET PUT END DOES ANOTHER WELL LARGE MUST " +
      "BIG EVEN SUCH BECAUSE TURN HERE WHY ASK WENT MEN READ NEED LAND DIFFERENT HOME US MOVE TRY KIND HAND PICTURE " +
      "AGAIN CHANGE OFF PLAY SPELL AIR AWAY ANIMAL HOUSE POINT PAGE LETTER MOTHER ANSWER FOUND STUDY STILL LEARN " +
      "SHOULD AMERICA WORLD HIGH EVERY NEAR ADD FOOD BETWEEN OWN BELOW COUNTRY PLANT LAST SCHOOL FATHER KEEP TREE " +
      "NEVER START CITY EARTH EYE LIGHT THOUGHT HEAD UNDER STORY SAW LEFT DONT FEW WHILE ALONG MIGHT CLOSE SOMETHING " +
      "SEEM NEXT HARD OPEN EXAMPLE BEGIN LIFE ALWAYS THOSE BOTH PAPER TOGETHER GOT GROUP OFTEN RUN IMPORTANT UNTIL " +
      "CHILDREN SIDE FEET CAR MILE NIGHT WALK WHITE SEA BEGAN GROW TOOK RIVER FOUR CARRY STATE ONCE BOOK HEAR STOP " +
      "WITHOUT SECOND LATER MISS IDEA ENOUGH EAT FACE WATCH FAR REAL ALMOST LET ABOVE GIRL SOMETIMES MOUNTAIN CUT " +
      "YOUNG TALK SOON LIST SONG BEING LEAVE FAMILY MESSAGE SIMPLE SECRET SECURE CODE CIPHER KEY ENCRYPT DECRYPT " +
      "ATTACK DEFEND MEET NOON DAWN SEND CAESAR SHIFT STANDARD PRACTICE TECHNIQUES COMMUNICATION CRYPTOGRAPHY " +
      "SECURITY NETWORK DATA TEXT PLAIN").split(" ");

    const WORDS_BY_PATTERN = {};
    function wordPattern(w) {
        const m = {}; let n = 0;
        return [...w].map(c => (m[c] === undefined ? (m[c] = n++) : m[c])).join(',');
    }
    WORD_LIST.forEach(w => {
        const p = wordPattern(w);
        (WORDS_BY_PATTERN[p] = WORDS_BY_PATTERN[p] || []);
        if (!WORDS_BY_PATTERN[p].includes(w)) WORDS_BY_PATTERN[p].push(w);
    });

    function solveByWords(cipher) {
        const words = [...new Set(cipher.split(/[^A-Z]+/).filter(Boolean))]
            .sort((a, b) => b.length - a.length)
            .slice(0, 25);
        let best = { score: -1, map: {} };
        let nodes = 0;

        function search(i, c2p, p2c, score) {
            if (++nodes > 200000) return;
            if (score > best.score) best = { score, map: { ...c2p } };
            if (i === words.length) return;

            const w = words[i];
            const cands = WORDS_BY_PATTERN[wordPattern(w)] || [];
            for (const cand of cands) {
                const added = [];
                let ok = true;
                for (let k = 0; k < w.length; k++) {
                    const c = w[k], p = cand[k];
                    if (c2p[c] === undefined && p2c[p] === undefined) {
                        c2p[c] = p; p2c[p] = c; added.push(c);
                    } else if (c2p[c] !== p) { ok = false; break; }
                }
                if (ok) search(i + 1, c2p, p2c, score + w.length);
                for (const c of added) { delete p2c[c2p[c]]; delete c2p[c]; }
            }
            search(i + 1, c2p, p2c, score);
        }

        search(0, {}, {}, 0);
        return best.map;
    }

    function autoSolve() {
        analyzeFrequency();
        if (analysisSection.style.display === 'none') return;

        const text = ciphertextInput.value.toUpperCase();
        const sid = sampleSelector.value;
        let mapping = {};
        let message;

        if (sid && samples[sid] && samples[sid].ciphertext === text.trim()) {
            mapping = samples[sid].mapping;
            message = "Solution filled in from the sample's answer key.";
        } else {
            const letterCount = (text.match(/[A-Z]/g) || []).length;
            if (letterCount >= 200) {
                const key = solveSubstitution(text);
                for (let i = 0; i < 26; i++) mapping[String.fromCharCode(65 + i)] = key[i];
                message = "Auto-solve gave its best guess. Fix any wrong letters by hand.";
            } else {
                mapping = solveByWords(text);
                message = "Short text: letters were filled in by matching words from a dictionary. " +
                          "Blank boxes mean no word matched. Fill those in by hand.";
            }
        }

        currentFreqData.forEach(item => {
            if (item.count > 0 && currentMappingInputs[item.char]) {
                currentMappingInputs[item.char].value = mapping[item.char] || '';
            }
        });

        applyMapping();
        verificationBox.className = 'alert-box info';
        verificationBox.textContent = message;
        verificationBox.style.display = 'block';
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
