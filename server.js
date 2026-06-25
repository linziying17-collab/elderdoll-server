const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/alert', async (req, res) => {
  const { type, message } = req.body;
  const appId = process.env.WX_APP_ID;
  const appSecret = process.env.WX_APP_SECRET;
  const templateId = process.env.WX_TEMPLATE_ID;
  const openId = process.env.WX_OPEN_ID;

  try {
    const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(500).json({ error: 'token failed', detail: tokenData });

    const msgRes = await fetch(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: openId,
        template_id: templateId,
        page: 'pages/index/index',
        data: {
  time1: { value: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) },
  thing5: { value: '家中' },
  phone_number6: { value: '请立即联系家人' },
  thing4: { value: message || '老人可能跌倒，请立即查看！' }
}
      })
    });
    const msgData = await msgRes.json();
    res.json({ success: true, result: msgData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Server running on port ' + (process.env.PORT || 3000)));
