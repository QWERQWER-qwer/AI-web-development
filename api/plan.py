from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.error


def build_prompt(d):
    optional = []
    if d.get("age"): optional.append("age " + str(d["age"]))
    if d.get("gender"): optional.append("gender " + str(d["gender"]))
    if d.get("bodyfat"): optional.append("bodyfat " + str(d["bodyfat"]) + "%")
    if d.get("muscle"): optional.append("muscle " + str(d["muscle"]) + "kg")
    opt = ", ".join(optional) if optional else "none"
    return (
        "You are a careful health coach. Write a safe, sustainable diet plan in Korean.\n"
        "Height: " + str(d.get("height")) + "cm, Current: " + str(d.get("weight")) + "kg, "
        "Target: " + str(d.get("target")) + "kg, Period: " + str(d.get("weeks")) + " weeks.\n"
        "Extra: " + opt + ". Job: " + str(d.get("job")) + ", Daily time: " + str(d.get("time"))
        + ", Budget: " + str(d.get("budget")) + ", Place: " + str(d.get("place")) + ".\n"
        "Rules: healthy loss is 0.5-1% of body weight per week; no extreme fasting; "
        "reflect budget, place and time; include weekly targets, diet, workout, cautions; "
        "end with a note that this is for reference only, not medical advice. Keep it concise."
    )


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                self._send(500, {"error": "API key not set"})
                return
            url = ("https://generativelanguage.googleapis.com/v1beta/models/"
                   "gemini-flash-latest:generateContent?key=" + api_key)
            payload = {
                "contents": [
                    {"parts": [{"text": build_prompt(data)}]}
                ],
                "generationConfig": {
                    "maxOutputTokens": 800,
                    "temperature": 0.7
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=55) as resp:
                result = json.loads(resp.read())
            plan = result["candidates"][0]["content"]["parts"][0]["text"]
            self._send(200, {"plan": plan})
        except urllib.error.HTTPError as e:
            self._send(e.code, {"error": "Gemini API error " + str(e.code)})
        except Exception as e:
            self._send(500, {"error": str(e)})

    def _send(self, status, obj):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj, ensure_ascii=False).encode("utf-8"))
