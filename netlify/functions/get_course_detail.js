// netlify/functions/get_course_detail.js
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(__dirname, 'course_full_content.json');
let fullCourseContent = {};

try {
    // 🌟 修正點：移除 'utf8' 參數，讓 Node.js 以 Buffer 方式讀取 
    // 🌟 並且手動去除可能存在的 BOM 字符（\ufeff）
    const rawData = fs.readFileSync(filePath, 'utf8');
    
    // 檢查並移除 Unicode BOM (Byte Order Mark) 雜質
    const cleanedData = rawData.startsWith('\ufeff') ? rawData.substring(1) : rawData; 
    
    fullCourseContent = JSON.parse(cleanedData).content; // 使用清理後的數據進行解析
} catch (error) {
    // 如果這個錯誤發生，Node.js 服務器會將錯誤寫入 Netlify Log
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

