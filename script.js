const questionGroups = {
    extraversion: [1, -6, 11, 16, -21, 26, -31, 36],
    agreeableness: [-2, 7, -12, 17, 22, -27, 32, -37, 42],
    conscientiousness: [3, -8, 13, -18, -23, 28, 33, 38, -43],
    neuroticism: [4, -9, 14, 19, -24, 29, -34, 39],
    openness: [5, 10, 15, 20, 25, 30, -35, 40, -41, 44]
};

document.getElementById('personalityTest').addEventListener('submit', function(e) {
    e.preventDefault();
    const results = calculateResults();
    displayResults(results);
});

function calculateResults() {
    const results = {
        extraversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        neuroticism: 0,
        openness: 0
    };

    // 各特性の計算
    for (let trait in questionGroups) {
        let sum = 0;
        let validAnswers = 0;

        questionGroups[trait].forEach(qNum => {
            const absNum = Math.abs(qNum);
            const value = parseInt(document.querySelector(`input[name="q${absNum}"]:checked`)?.value);
            
            if (!isNaN(value)) {
                sum += qNum < 0 ? reverseScore(value) : value;
                validAnswers++;
            }
        });

        results[trait] = validAnswers > 0 ? sum / validAnswers : 0;
    }

    return results;
}

function reverseScore(score) {
    return 6 - score;
}

function displayResults(results) {
    document.getElementById('results').classList.remove('hidden');
    
    const traitNames = {
        extraversion: 'E',
        agreeableness: 'A',
        conscientiousness: 'C',
        neuroticism: 'N',
        openness: 'O'
    };

    Object.entries(results).forEach(([trait, score]) => {
        const percentage = (score / 5) * 100;
        const letter = traitNames[trait];
        
        document.getElementById(`score${letter}`).style.width = `${percentage}%`;
        document.getElementById(`scoreValue${letter}`).textContent = 
            `${score.toFixed(2)} / 5.00`;
    });
} 