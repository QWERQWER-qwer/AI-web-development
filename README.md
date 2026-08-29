# 헬시플랜 (HealthyPlan)

키·체중·목표·기간·예산·생활환경을 입력하면, **건강한 감량 속도를 기준으로 맞춤 다이어트 플랜**을 만들어주는 AI 웹 서비스입니다.

## 🔗 배포 URL
> 배포 후 여기에 Vercel URL을 넣으세요: `https://your-project.vercel.app`

## ✨ 주요 기능
- 키·체중 입력 시 **BMI 실시간 계산** 및 저체중 목표 경고
- **과도한 감량 속도 검증**(주당 현재 체중의 1% 초과 시 차단)
- 직업·가용 시간·예산·운동 환경을 반영한 **AI 맞춤 플랜 생성** (OpenAI)
- 반응형 디자인(모바일·태블릿·데스크톱)
- 실패 처리: 빈 입력 / API 오류 / 응답 지연 안내

## 🛠 기술 스택
- **프론트엔드**: HTML / CSS / JavaScript (프레임워크 미사용)
- **백엔드**: Vercel Serverless Functions (Python)
- **AI**: OpenAI API (`gpt-4o-mini`)
- **배포**: Vercel / **형상관리**: GitHub

## 📁 프로젝트 구조
```
fitplan/
├── index.html          # 메인 (4개 섹션)
├── css/style.css       # 스타일 (반응형)
├── js/main.js          # BMI 계산, 검증, API 호출
├── api/plan.py         # OpenAI 호출 서버리스 함수
├── requirements.txt    # Python 패키지 (표준 라이브러리만 사용)
├── vercel.json         # Vercel 설정
└── README.md
```

## ⚙️ 환경 변수 설정 (중요)
API 키는 **절대 코드에 넣지 않고** 환경 변수로 관리합니다.

### 로컬 테스트
프로젝트 루트에 `.env.local` 파일을 만들고:
```
OPENAI_API_KEY=sk-여기에_본인_키
```
> `.env.local`은 `.gitignore`에 포함되어 커밋되지 않습니다.

### Vercel 배포 시
1. Vercel 프로젝트 → **Settings → Environment Variables**
2. Name: `OPENAI_API_KEY`, Value: 본인 키 입력 → Save
3. 재배포(Redeploy)

## 🚀 실행 / 배포 방법
### 로컬 실행
```bash
npm i -g vercel      # Vercel CLI 설치
vercel dev           # 로컬에서 프론트+서버리스 함께 실행
```
브라우저에서 `http://localhost:3000` 접속.

### 배포
1. 이 저장소를 GitHub에 push
2. [vercel.com](https://vercel.com) → New Project → GitHub 저장소 import
3. 환경 변수 `OPENAI_API_KEY` 등록
4. Deploy → 발급된 URL에서 동작 확인

## ⚠️ 유의사항
- 본 서비스의 플랜은 **참고용이며 의학적 조언이 아닙니다.**
- API 키가 유출되면 즉시 폐기·재발급하고, 노출된 커밋 이력을 정리하세요.
- OpenAI API는 사용량에 따라 과금될 수 있습니다.
