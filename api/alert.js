module.exports = async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, message } = req.body;
  
  const appId = process.env.WX_APP_ID;
  const appSecret = process.env.WX_APP_SECRET;
  const templateId = process.env.WX_TEMPLATE_ID;
  const openId = process.env.WX_OPEN_ID;

  try {
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to get token', detail: tokenData });
    }

    const msgRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touser: openId,
          template_id: templateId,
          page: 'pages/index/index',
          data: {
            thing1: { value: message || '老人可能跌倒' },
            time2: { value: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) },
            thing3: { value: type || '跌倒告警' }
          }
        })
      }
    );

    const msgData = await msgRes.json();
    return res.status(200).json({ success: true, result: msgData });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
