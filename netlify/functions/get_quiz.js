// netlify/functions/get_quiz.js
const path = require('path');
const fs = require('fs');

// 1. 使用絕對路徑結合 __dirname 來讀取靜態 JSON 檔案
const filePath = path.join(__dirname, 'quiz_data.json');
let fullQuizData = [];

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    fullQuizData = JSON.parse(rawData);
} catch (error) {
    // 如果讀取失敗，將錯誤紀錄下來，並讓 fullQuizData 保持為空陣列
    console.error("Failed to load quiz_data.json using fs:", error);
}

exports.handler = async (event) => {
    try {
        if (fullQuizData.length === 0) {
            // 如果讀取失敗，返回 500 錯誤給前端
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Quiz data failed to load or is empty.' }),
            };
        }

        // 1. 隨機選取 10 題
        const shuffled = fullQuizData.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);

        // 2. 準備傳給前端的題目 (不含答案)
        const quizForClient = selectedQuestions.map(q => ({
            id: q.id,
            topic: q.topic,
            options: q.options,
        }));
        
        // 3. 準備傳給後端 (submit_quiz) 的答案快取
        const answersForServer = selectedQuestions.map(q => ({
            id: q.id,
            answerIndex: q.answerIndex,
            source: q.source,
        }));

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
            body: JSON.stringify({ success: false, message: 'An unexpected error occurred in quiz generation.' }),
        };
    }
};
