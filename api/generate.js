// Vercel Serverless Function - 安全调用千问API
import axios from 'axios';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, prompt } = req.body;

  if (!topic) {
    return res.status(400).json({ error: '缺少公文主题' });
  }

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-max',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一位专业林业局公文写作助手，擅长撰写湿地保护、野生动物保护等政府公文。请严格按照政府公文格式生成内容，语言正式严谨，避免口语化。'
            },
            {
              role: 'user',
              content: `主题：${topic}。要求：${prompt || '请生成一份标准的林业公文，语言正式严谨，字数800字左右。'}`
            }
          ]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
        },
        timeout: 10000
      }
    );

    const content = response.data.output.choices[0].message.content;
    res.status(200).json({ content });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    const msg = error.response?.data?.error?.message || error.message || '生成失败';
    res.status(500).json({ error: msg });
  }
}
