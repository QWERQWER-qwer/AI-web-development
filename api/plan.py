from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.error


def build_prompt(d):
    """입력값으로 AI 프롬프트를 구성한다."""
    height = d.get("height")
    weight = d.get("weight")
    target = d.get("target")
    weeks = d.get("weeks")

    optional = []
    if d.get("age"):
        optional.append(f"나이 {d['age']}세")
    if d.get("gender"):
        optional.append(f"성별 {d['gender']}")
    if d.get("bodyfat"):
        optional.append(f"체지방률 {d['bodyfat']}%")
    if d.get("muscle"):
        optional.append(f"골격근량 {d['muscle']}kg")
    optional_str = ", ".join(optional) if optional else "추가 정보 없음"

    return f"""당신은 신중한 건강 코치입니다. 아래 사용자 정보를 바탕으로 안전하고 지속 가능한 다이어트 플랜을 한국어로 작성하세요.

[사용자 정보]
- 키: {height}cm
- 현재 체중: {weight}kg
- 목표 체중: {target}kg
- 목표 기간: {weeks}주
- 추가 정보: {optional_str}
- 직업: {d.get('job')}
- 하루 가용 시간: {d.get('time')}
- 월 예산: {d.get('budget')}
- 운동 환경: {d.get('place')}

[작성 규칙]
1. 건강한 감량 속도는 주당 현재 체중의 0.5~1% 범위임을 전제로 한다.
2. 무리한 단식·극단적 제한은 권하지 않는다.
3. 예산과 운동 환경(헬스장/홈트), 가용 시간을 반영한 현실적인 조언을 한다.
4. 아래 구성으로 작성한다:
   - 주차별 감량 목표(대략적 kg)
   - 식단 방향(예산 고려)
   - 운동 루틴(환경·시간 고려)
   - 주의사항
5. 마지막에 "본 플랜은 참고용이며 의학적 조언이 아닙니다"라고 명시한다.
6. 지나치게 길지 않게, 읽기 쉬운 구조로 작성한다."""


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            data = json.loads(body)

            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                self._send(500, {"error": "API 키가 설정되지 않았습니다."})
                return

            prompt = build_prompt(data)

            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "당신은 안전을 최우선으로 하는 건강 코치입니다."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
            }

            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=25) as resp:
                result = json.loads(resp.read())

            plan = result["choices"][0]["message"]["content"]
            self._send(200, {"plan": plan})

        except urllib.error.HTTPError as e:
            self._send(e.code, {"error": f"OpenAI API 오류: {e.code}"})
        except Exception as e:
            self._send(500, {"error": str(e)})

    def _send(self, status, obj):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj, ensure_ascii=False).encode("utf-8"))
