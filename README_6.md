# 헬시플랜 (HealthyPlan)

키·체중·목표·기간·예산·생활환경을 입력하면, **건강한 감량 속도를 기준으로 맞춤 다이어트 플랜**을 만들어주는 AI 웹 서비스입니다.

## 🔗 배포 URL
**https://ai-web-development-pied.vercel.app**

## ✨ 주요 기능
- 키·체중 입력 시 **BMI 실시간 계산** 및 저체중 목표 경고
- **과도한 감량 속도 검증**(주당 현재 체중의 1% 초과 시 차단) — 건강한 다이어트 유도
- 직업·가용 시간·예산·운동 환경을 반영한 **AI 맞춤 플랜 생성** (Google Gemini)
- 반응형 디자인(모바일·태블릿·데스크톱)
- 실패 처리: 빈 입력 / API 오류 / 응답 지연 안내

## 🛠 기술 스택
- **프론트엔드**: HTML / CSS / JavaScript (프레임워크 미사용)
- **백엔드**: Vercel Serverless Functions (Python)
- **AI**: Google Gemini API (`gemini-flash-latest`)
- **배포**: Vercel / **형상관리**: GitHub

## 📁 프로젝트 구조
```
.
├── index.html          # 메인 (4개 섹션: 홈/플랜생성/가이드·FAQ/문의)
├── css/style.css       # 스타일 (반응형)
├── js/main.js          # BMI 계산, 입력 검증, API 호출, 실패 처리
├── api/plan.py         # Gemini 호출 서버리스 함수
├── requirements.txt    # Python 패키지 (표준 라이브러리만 사용)
├── vercel.json         # Vercel 설정
├── .python-version     # Python 버전 지정 (3.12)
└── README.md
```

## ⚙️ 환경 변수 설정 (중요)
API 키는 **절대 코드에 넣지 않고** 환경 변수로 관리합니다.

### 로컬 테스트
프로젝트 루트에 `.env.local` 파일을 만들고:
```
GEMINI_API_KEY=본인의_Gemini_API_키
```
> `.env.local`은 `.gitignore`에 포함되어 커밋되지 않습니다.
> Gemini API 키는 [Google AI Studio](https://aistudio.google.com/apikey)에서 무료로 발급받을 수 있습니다.

### Vercel 배포 시
1. Vercel 프로젝트 → **Settings → Environment Variables**
2. Name: `GEMINI_API_KEY`, Value: 본인 키 입력 → Save
3. 재배포(Redeploy)

## 🚀 실행 / 배포 방법
### 배포 (GitHub + Vercel 연동)
1. 이 저장소를 GitHub에 push
2. [vercel.com](https://vercel.com) → New Project → GitHub 저장소 import
3. Framework Preset을 **Other**로 설정
4. 환경 변수 `GEMINI_API_KEY` 등록
5. Deploy → 발급된 URL에서 동작 확인

## 🖥 스크린샷
### 데스크톱 — 홈
![데스크톱 홈](docs/desktop-home.png)

### AI 기능 동작 (맞춤 플랜 생성 결과)
![AI 플랜 결과](docs/ai-result.png)

### 모바일 (반응형)
![모바일](docs/mobile.png)

## ⚠️ 유의사항
- 본 서비스의 플랜은 **참고용이며 의학적 조언이 아닙니다.**
- API 키가 유출되면 즉시 폐기·재발급하고, 노출된 커밋 이력을 정리하세요.
- Gemini API는 무료 티어 사용량(요청 한도)이 있으며, 초과 시 일시적으로 요청이 제한될 수 있습니다.
