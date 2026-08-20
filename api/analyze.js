/**
 * Vercel Serverless Function: Google Gemini 3.6 Flash 기반 감정 분석 API
 * 엔드포인트: POST /api/analyze
 */

export default async function handler(req, res) {
  // CORS 및 메서드 검증
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text } = req.body || {};

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "일기 내용(text)을 입력해주세요." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
      return res.status(500).json({
        error: "서버에 GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다."
      });
    }

    const prompt = `당신은 사용자의 일기를 읽고 마음을 따뜻하게 안아주는 전문 심리 상담 AI '마음 쉼터'입니다.
사용자가 작성한 일기 내용을 깊이 공감하며 읽고, 감정을 분석하여 반드시 아래 JSON 규격으로만 응답해주세요:
{
  "emotionKey": "joy" (joy, sadness, anger, calm, tired, anxiety, gratitude 중 일기와 가장 잘 맞는 단 하나),
  "emotionName": "감정 명칭 (예: 기쁨 & 설렘, 슬픔 & 위로, 평온 & 여유, 지침 & 휴식필요, 분노 & 답답함, 불안 & 걱정, 감사 & 따뜻함 등)",
  "emotionEmoji": "대표 이모지 1개 (예: 😃, 😢, 😡, 🌿, 🥱, 🥺, 💖 등)",
  "emotionTitle": "일기에 딱 맞춘 다정하고 센스 있는 한 줄 요약 문구",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "message": "사용자의 구체적인 상황과 감정에 깊이 공감하고 진심 어린 위로와 응원을 전하는 2~3줄의 다정한 메시지 (자연스러운 문장과 줄바꿈 포함)"
}

[사용자 일기 내용]
${text.trim()}`;

    // Google Gemini 3.6 Flash API 호출
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini 3.6 Flash API Error:", response.status, errorData);
      return res.status(response.status).json({
        error: "Gemini AI 분석 호출에 실패했습니다.",
        details: errorData
      });
    }

    const data = await response.json();
    const rawAiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawAiText) {
      return res.status(500).json({ error: "AI 응답 결과를 파싱할 수 없습니다." });
    }

    let cleanJson = rawAiText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON parse error:", rawAiText);
      return res.status(500).json({ error: "AI 응답 형식이 올바르지 않습니다.", raw: rawAiText });
    }

    return res.status(200).json({
      success: true,
      data: parsedResult
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      error: "서버 내부 오류가 발생했습니다.",
      message: error.message
    });
  }
}
