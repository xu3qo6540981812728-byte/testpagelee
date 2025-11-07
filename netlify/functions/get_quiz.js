const fullQuizData = require('./quiz_data.json'); 

exports.handler = async (event) => {
    try {
        if (fullQuizData.length === 0) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Quiz data not loaded or empty.' }),
            };
        }

        // 1. 隨機選取 10 題 (這裡的邏輯保持不變)
        const shuffled = fullQuizData.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);

        // ... 後續程式碼保持不變 ...

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                success: true, 
                quiz: quizForClient, 
                answersCache: answersForServer 
            }),
        };
    } catch (e) {
        // 如果上面 require() 失敗，會在這裡捕捉
        console.error('Error in get_quiz handler:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Failed to generate quiz.' }),
        };
    }
};
