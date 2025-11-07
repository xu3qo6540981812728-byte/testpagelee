const fs = require('fs');
const path = require('path');

// 載入完整的題庫 (包含答案)
const quizDataPath = path.join(__dirname, 'quiz_data.json');
let fullQuizData;
try {
    fullQuizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
} catch (e) {
    console.error('Error loading quiz_data.json:', e);
    fullQuizData = [];
}

exports.handler = async (event) => {
    try {
        if (fullQuizData.length === 0) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Quiz data not loaded or empty.' }),
            };
        }

        // 1. 隨機選取 10 題
        const shuffled = fullQuizData.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);

        // 2. 準備回傳給前端的資料 (不包含答案)
        const quizForClient = selectedQuestions.map(q => ({
            id: q.id,
            topic: q.topic,
            options: q.options
        }));

        // 3. 準備給批改用的答案快取 (包含答案)
        const answersForServer = selectedQuestions.map(q => ({
            id: q.id,
            answerIndex: q.answerIndex,
            correctOption: ['A', 'B', 'C', 'D'][q.answerIndex] // 方便批改時顯示正確選項
        }));
        
        // 4. (選用) 存儲答案快取：這裡我們為了簡化，直接將答案快取一起回傳，讓 submit_quiz.js 進行比對
        //    但在實際生產環境中，答案快取應該存在安全的資料庫或 session 中。
        //    由於 Netlify Function 的限制，我們將答案快取包含在回傳的物件中，並讓 submit_quiz.js 處理。

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
        console.error('Error in get_quiz handler:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Failed to generate quiz.' }),
        };
    }
};