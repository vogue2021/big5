const questionGroups = {
    extraversion: [1, -6, 11, 16, -21, 26, -31, 36],
    agreeableness: [-2, 7, -12, 17, 22, -27, 32, -37, 42],
    conscientiousness: [3, -8, 13, -18, -23, 28, 33, 38, -43],
    neuroticism: [4, -9, 14, 19, -24, 29, -34, 39],
    openness: [5, 10, 15, 20, 25, 30, -35, 40, -41, 44]
};

const correlationWeights = {
    openness: {
        visual: 0.59,
        audio: 0.79,
        reading: 0.63,
        kinaesthetic: 0.51
    },
    conscientiousness: {
        visual: 0.70,
        audio: 0.74,
        reading: 0.93,
        kinaesthetic: 0.65
    },
    extraversion: {
        visual: 0.83,
        audio: 0.89,
        reading: 0.81,
        kinaesthetic: 0.45
    },
    agreeableness: {
        visual: 1.00,
        audio: 1.00,
        reading: 1.00,
        kinaesthetic: 0.75
    },
    neuroticism: {
        visual: 0.23,
        audio: 0.03,
        reading: 0.21,
        kinaesthetic: 0.27
    }
};

// 在文件顶部添加一个变量来存储图表实例
let varkChart = null;

document.getElementById('personalityTest').addEventListener('submit', function(e) {
    e.preventDefault();
    const big5Results = calculateResults();
    const varkResults = calculateLearningStyle(big5Results);
    displayResults(big5Results, varkResults);
});

function calculateResults() {
    const results = {
        extraversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        neuroticism: 0,
        openness: 0
    };

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

        results[trait] = validAnswers > 0 ? (sum / validAnswers) * 20 : 0; // 转换为0-100的分数
    }

    return results;
}

function calculateLearningStyle(personalityScores) {
    const learningScores = {
        visual: 0,
        audio: 0,
        reading: 0,
        kinaesthetic: 0
    };

    // 计算每种学习风格的得分
    for (let trait in personalityScores) {
        for (let style in learningScores) {
            learningScores[style] += (personalityScores[trait] / 100) * correlationWeights[trait][style];
        }
    }

    // 归一化处理
    const totalScore = Object.values(learningScores).reduce((a, b) => a + b, 0);
    const normalizedScores = {};
    for (let style in learningScores) {
        normalizedScores[style] = Math.round((learningScores[style] / totalScore) * 1000) / 10;
    }

    return normalizedScores;
}

function reverseScore(score) {
    return 6 - score;
}

function displayResults(big5Results, varkResults) {
    document.getElementById('results').classList.remove('hidden');
    
    // 获取实验者编号
    const experimenterId = document.getElementById('experimenterId').value;
    
    // 保存数据到后端
    const resultData = {
        experimenterId: experimenterId,
        timestamp: new Date().toISOString(),
        big5Results: big5Results,
        varkResults: varkResults
    };

    // 发送数据到后端
    fetch('/save-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Results saved successfully:', data);
    })
    .catch((error) => {
        console.error('Error saving results:', error);
    });

    // 创建图表前先销毁旧的图表
    if (varkChart) {
        varkChart.destroy();
    }

    // 创建新图表
    const ctx = document.getElementById('varkChart').getContext('2d');
    varkChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'],
            datasets: [{
                label: '学習スタイル分布',
                data: [
                    varkResults.visual,
                    varkResults.audio,
                    varkResults.reading,
                    varkResults.kinaesthetic
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // 找出最高分的学习风格
    const styles = {
        visual: {
            name: '視覚的学習 (Visual)',
            description: '図表、画像、映像などの視覚的な教材を使用することで最も効果的に学習できます。'
        },
        audio: {
            name: '聴覚的学習 (Auditory)',
            description: '講義を聴く、ディスカッションする、音声教材を使用することで最も効果的に学習できます。'
        },
        reading: {
            name: '読み書き学習 (Reading/Writing)',
            description: 'テキストを読んだり、ノートを取ったり、文章を書いたりすることで最も効果的に学習できます。'
        },
        kinaesthetic: {
            name: '運動感覚的学習 (Kinesthetic)',
            description: '実践的な体験、実験、ハンズオン活動を通じて最も効果的に学習できます。'
        }
    };

    // 修改这部分：找出得分最高的学习风格
    let maxScore = 0;
    let mainStyle = '';
    for (const [style, score] of Object.entries(varkResults)) {
        if (score > maxScore) {
            maxScore = score;
            mainStyle = style;
        }
    }

    // 表示推荐的学习风格
    if (mainStyle && styles[mainStyle]) {
        document.getElementById('mainStyle').innerHTML = `
            <i class="fas fa-star"></i> ${styles[mainStyle].name}
        `;
        document.getElementById('styleDescription').innerHTML = styles[mainStyle].description;
    }
} 