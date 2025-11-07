exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userAnswers, answersCache } = JSON.parse(event.body);

        let correctCount = 0;
        const results = [];
        
        // 將答案快取轉換為 Map 方便查找
        const correctAnswersMap = new Map(answersCache.map(a => [a.id, a]));

        for (const userAnswer of userAnswers) {
            const correctAnswer = correctAnswersMap.get(userAnswer.questionId);
            const isCorrect = correctAnswer && (correctAnswer.answerIndex === userAnswer.selectedIndex);
            
            if (isCorrect) {
                correctCount++;
            }

            results.push({
                questionId: userAnswer.questionId,
                isCorrect: isCorrect,
                userSelectedIndex: userAnswer.selectedIndex,
                correctSelectedIndex: correctAnswer ? correctAnswer.answerIndex : null,
                correctOption: correctAnswer ? correctAnswer.correctOption : 'N/A',
                userOption: ['A', 'B', 'C', 'D'][userAnswer.selectedIndex] || '未作答'
            });
        }

        const score = correctCount * 10; // 總共 10 題，每題 10 分

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                success: true, 
                score: score, 
                correctCount: correctCount,
                totalQuestions: userAnswers.length,
                results: results 
            }),
        };
    } catch (e) {
        console.error('Error in submit_quiz handler:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Failed to submit quiz.' }),
        };
    }
};