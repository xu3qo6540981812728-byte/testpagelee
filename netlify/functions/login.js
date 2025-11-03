// 【最終版】netlify/functions/login.js
const fs = require('fs');
const path = require('path');

const users = [
    { username: 'C73449', password: '19940201', name: '李培智', role: 'manager', team: 'A組' }, 
    { username: 'C84730', password: '19851010', name: '李志仁', role: 'agent', team: 'A組' }, 
    { username: 'C80624', password: '19930109', name: '葉欣宜', role: 'agent', team: 'A組' },  
    { username: 'C91517', password: '20010721', name: '劉懷懋', role: 'agent', team: 'A組' },
    { username: 'C87976', password: '19980216', name: '林俊翔', role: 'agent', team: 'A組' },
    { username: 'shinelee', password: 'shinelee', name: '李正翔', role: 'manager', team: 'B組' },
    { username: 'guest', password: 'guest', name: '訪客', role: 'agent', team: 'B組' },
];

exports.handler = async function(event, context) {
    
    // 【修正點：將 try...catch 放置在最外層】
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }
        
        const { username, password } = JSON.parse(event.body);

        const foundUser = users.find(
            user => user.username === username && user.password === password
        );

        if (foundUser) {
            // 登入成功，回傳成功狀態、使用者帳號，【新增回傳 name, role, team】
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    success: true, 
                    username: foundUser.username,
                    name: foundUser.name, 
                    role: foundUser.role, 
                    team: foundUser.team  
                })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: '帳號或密碼錯誤' })
            };
        }
    } catch (error) { 
        // 捕獲任何解析 JSON 或其他執行錯誤
        console.error("Login Function Error: ", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: '伺服器發生內部錯誤' }) 
        };
    }
};


