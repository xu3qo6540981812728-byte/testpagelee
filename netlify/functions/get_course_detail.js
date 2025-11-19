// netlify/functions/get_course_detail.js
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'course_full_content.json');
let fullCourseContent = {};

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    fullCourseContent = JSON.parse(rawData).content; // 僅提取 "content" 鍵下的內容
} catch (error) {
    console.error("Failed to load course_full_content.json:", error);
}

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }

        // 成功回傳所有章節的 HTML 內容
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true, 
                content: fullCourseContent // { "chapter0": "<div>...", "chapter1": "<div>..." }
            }),
        };
    } catch (e) {
        console.error('Error in get_course_detail handler:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'An unexpected error occurred.' }),
        };
    }
};