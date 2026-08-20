# 🌸 마음 일기 (Mind Diary AI)

Google Gemini 2.5 Flash 생성형 AI와 Firebase Cloud Firestore 기반의 감성 일기장 웹 애플리케이션입니다.

---

## 🌟 주요 기능
- 🎙️ **실시간 음성 인식 (Web Speech API)**: 마이크로 말하면 실시간으로 텍스트 자동 입력
- ✨ **생성형 AI 감정 분석 (Google Gemini 2.5 Flash)**: 일기 내용을 분석하여 대표 감정 이모지, 핵심 키워드, 다정한 위로/응원 맞춤 메시지 생성
- 💾 **Firebase Cloud Firestore 저장**: 작성한 일기와 AI 분석 결과를 클라우드 및 브라우저 로컬 저장소에 안전하게 보관
- 📚 **일기 보관함**: 언제든 과거 일기를 다시 불러오거나 삭제 가능
- 🔊 **TTS 음성 낭독 & 클립보드 복사**: AI의 따뜻한 답변을 음성으로 듣거나 원클릭 복사

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 설치 없이 Node.js로 바로 실행
npm start
# 또는
node server.js
```
브라우저에서 **`http://localhost:8000`** 접속

---

## ☁️ GitHub 업로드 및 Vercel 배포 가이드

### 1. GitHub 리포지토리 생성 및 푸시
> ⚠️ `.env` 파일은 `.gitignore`에 등록되어 있어 API 키가 GitHub에 공개되지 않습니다.

```bash
git init
git add .
git commit -m "feat: AI Emotion Diary with Gemini & Firebase"
git branch -M main
git remote add origin https://github.com/사용자이름/리포지토리이름.git
git push -u origin main
```

---

### 2. Vercel 배포 및 환경 변수 등록
1. [Vercel](https://vercel.com/)에 로그인하고 **Add New... > Project** 클릭
2. 방금 올린 GitHub 저장소를 **Import**
3. **Environment Variables** 설정에서 아래 환경 변수 추가:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AQ.Ab8RN6JUb7oztumiR-4TgNi31H25EZWY2CElLA6fpYpWYpCaDA`
4. **Deploy** 버튼 클릭! 🎉

---

### 3. Firebase Firestore 보안 규칙 설정
[Firebase 콘솔](https://console.firebase.google.com/project/diary-6ac61/firestore/rules) > **Firestore Database > 규칙 (Rules)** 탭에서 아래 규칙을 게시합니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
