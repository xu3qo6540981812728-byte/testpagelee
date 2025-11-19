// netlify/functions/get_course_detail.js

// ** 關鍵修正：使用 require 直接載入 JSON 內容 **
// 這裡假設 course_full_content.json 已經位於同一目錄
const fullCourseContent = require('./course_full_content.json').content;

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }
        
        // 檢查內容是否成功載入
        if (!fullCourseContent || Object.keys(fullCourseContent).length === 0) {
             console.error("Content is empty or failed to load via require.");
             // 確保即使內容為空，回傳格式也是正確的
             return {
                 statusCode: 200,
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                     success: false, 
                     message: 'Course content is empty.'
                 }),
             };
        }

        // 成功回傳所有章節的 HTML 內容
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true, 
                content: fullCourseContent 
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
