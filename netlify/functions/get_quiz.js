// netlify/functions/get_quiz.js

const path = require('path');
const fs = require('fs');

// 1. 使用絕對路徑結合 __dirname，確保在任何環境下都能正確找到檔案
const filePath = path.join(__dirname, 'quiz_data.json');

// 2. 使用同步讀取檔案的方式，並手動解析 JSON
let fullQuizData = [];

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    fullQuizData = JSON.parse(rawData);
} catch (error) {
    console.error("Failed to load quiz_data.json using fs:", error);
    // 這裡我們讓 fullQuizData 保持為 []，並在 handler 內返回 500 錯誤
}


exports.handler = async (event) => {
    // 這裡的邏輯將使用 try...catch 來捕獲載入失敗時的 fullQuizData = [] 狀況
    try {
        if (fullQuizData.length === 0) {
            // 如果檔案載入失敗（無論是 fs 錯誤還是 require 錯誤），都返回 500
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Quiz data is empty or failed to load. Check Function logs.' }),
            };
        }

        // 1. 隨機選取 10 題 (您的原始邏輯)
        const shuffled = fullQuizData.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);

        // 2. 準備傳給前端的資料 (不含答案)
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
            body: JSON.stringify({ success: false, message: 'An unexpected error occurred in quiz generation.' + e.message }),
        };
    }
};
