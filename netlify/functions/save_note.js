// netlify/functions/save_note.js

// 載入所需模組
const users = require('./users.json');
const admin = require('firebase-admin');

// ----------------------------------------------------
// 【初始化 Firebase Admin SDK：修正為 Node.js 習慣】
// 確保 Admin SDK 只初始化一次
// ----------------------------------------------------
if (admin.apps.length === 0) {
    try {
        // 從環境變數 FIREBASE_SA_BASE64 讀取 Base64 編碼的服務帳號憑證
        if (!process.env.FIREBASE_SA_BASE64) {
            console.error("Environment variable FIREBASE_SA_BASE64 is not set.");
            // 由於這是 Function 的核心依賴，如果缺失則拋出錯誤。
            throw new Error("Firebase Service Account credentials missing.");
        }

        // 解碼 Base64 字串並解析為 JSON 物件
        const serviceAccountJson = JSON.parse(
            Buffer.from(process.env.FIREBASE_SA_BASE64, 'base64').toString('utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson),
        });
        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error.message);
        // 拋出錯誤以阻止 Function 繼續執行 (將導致 500 錯誤)
        throw new Error("Firebase initialization failed."); 
    }
}


// ----------------------------------------------------
// 【核心功能：更新備註到 Firestore】
// ----------------------------------------------------
async function updateProgressDatabase(targetUsername, chapterId, noteContent) {
    try {
        const db = admin.firestore();
        const progressDocRef = db.collection('progressData').doc(targetUsername);

        // 使用 field path 語法來更新 document 中的特定欄位。
        // 格式為： { "索引.欄位名稱": 值 }
        const updateObject = {};
        updateObject[`${chapterId}.manager_note`] = noteContent;

        // 使用 set({ merge: true }) 確保只更新 manager_note 欄位，不覆蓋其他進度
        await progressDocRef.set(updateObject, { merge: true });
        
        console.log(`[DB Write SUCCESS] User: ${targetUsername}, Index: ${chapterId}`);
        return true;
    } catch (error) {
        console.error('Firebase Write Error:', error);
        // 拋出一個統一的錯誤訊息
        throw new Error('Failed to write note to database.');
    }
}


// ----------------------------------------------------
// 【Netlify Function 入口點】
// ----------------------------------------------------
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid JSON body' }) };
    }

    const { manager_username, target_username, chapter_id, note_content } = body;

    // 1. 驗證請求者是否為主管 (Manager)
    const manager = users.find(user => user.username === manager_username);
    if (!manager || manager.role !== 'manager') {
        return { statusCode: 403, body: JSON.stringify({ success: false, message: '權限不足，只有主管可以新增備註。' }) };
    }

    // 2. 寫入備註到資料庫
    try {
        const success = await updateProgressDatabase(target_username, chapter_id, note_content);
        
        return { statusCode: 200, body: JSON.stringify({ success: success, message: '備註儲存成功' }) };

   } catch (error) {
        // 捕獲來自 updateProgressDatabase 的錯誤
        console.error('Save Note error:', error.toString());
        return { statusCode: 500, body: JSON.stringify({ success: false, message: '伺服器內部錯誤，備註未能儲存。' }) }; // <-- 修正後的程式碼
    }
};
