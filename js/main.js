// ===== 요소 참조 =====
const $ = (id) => document.getElementById(id);
const bmiBox = $("bmiBox");
const resultBox = $("result");

// ===== BMI 실시간 계산 =====
function calcBMI() {
  const h = parseFloat($("height").value);
  const w = parseFloat($("weight").value);
  const t = parseFloat($("target").value);
  if (!h || !w) { bmiBox.innerHTML = ""; return; }
  const bmi = w / ((h / 100) ** 2);
  let msg = "현재 BMI: <b>" + bmi.toFixed(1) + "</b> (" + bmiLabel(bmi) + ")";
  if (t) {
    const targetBmi = t / ((h / 100) ** 2);
    msg += "<br />목표 BMI: <b>" + targetBmi.toFixed(1) + "</b> (" + bmiLabel(targetBmi) + ")";
    if (targetBmi < 18.5) {
      msg += "<br /><span class=\"warn\">⚠ 목표 체중이 저체중 범위예요. 더 건강한 목표를 권장해요.</span>";
    }
  }
  bmiBox.innerHTML = msg;
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return "저체중";
  if (bmi < 23) return "정상";
  if (bmi < 25) return "과체중";
  return "비만";
}

["height", "weight", "target"].forEach((id) =>
  $(id).addEventListener("input", calcBMI)
);

// ===== 과도한 감량 속도 검증 =====
function checkPace(w, t, weeks) {
  const lossPerWeek = (w - t) / weeks;
  const maxPerWeek = w * 0.01;
  return { lossPerWeek: lossPerWeek, maxPerWeek: maxPerWeek, tooFast: lossPerWeek > maxPerWeek };
}

// ===== 플랜 생성 =====
$("generateBtn").addEventListener("click", async () => {
  const data = {
    height: parseFloat($("height").value),
    weight: parseFloat($("weight").value),
    target: parseFloat($("target").value),
    weeks: parseFloat($("weeks").value),
    age: $("age").value,
    gender: $("gender").value,
    bodyfat: $("bodyfat").value,
    muscle: $("muscle").value,
    job: $("job").value,
    time: $("time").value,
    budget: $("budget").value,
    place: $("place").value,
  };

  if (!data.height || !data.weight || !data.target || !data.weeks) {
    resultBox.innerHTML = "<span class=\"err\">키·체중·목표 체중·기간을 모두 입력해주세요.</span>";
    return;
  }
  if (data.target >= data.weight) {
    resultBox.innerHTML = "<span class=\"err\">목표 체중은 현재 체중보다 낮아야 해요.</span>";
    return;
  }

  const pace = checkPace(data.weight, data.target, data.weeks);
  const targetBmi = data.target / ((data.height / 100) ** 2);
  if (targetBmi < 18.5) {
    resultBox.innerHTML = "<span class=\"err\">목표 체중이 저체중 범위예요. 기간을 늘리거나 목표를 조정해 주세요.</span>";
    return;
  }
  if (pace.tooFast) {
    resultBox.innerHTML = "<span class=\"err\">건강한 감량 속도(주당 약 " + pace.maxPerWeek.toFixed(1) +
      "kg)를 초과했어요. 기간을 늘려주세요.</span>";
    return;
  }

  resultBox.innerHTML = "<span class=\"loading\">AI가 플랜을 만들고 있어요... ⏳</span>";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      let detail = "";
      try { const j = await res.json(); detail = j.error ? " — " + j.error : ""; } catch (e) {}
      resultBox.innerHTML = "<span class=\"err\">오류가 발생했어요 (" + res.status + ")" + detail + "</span>";
      return;
    }

    const json = await res.json();
    resultBox.textContent = json.plan || "결과를 받지 못했어요.";
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      resultBox.innerHTML = "<span class=\"err\">응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.</span>";
    } else {
      resultBox.innerHTML = "<span class=\"err\">네트워크 오류가 발생했어요. 다시 시도해주세요.</span>";
    }
  }
});

// ===== 문의 폼 =====
$("contactBtn").addEventListener("click", () => {
  const name = $("c_name").value.trim();
  const msg = $("c_msg").value.trim();
  const out = $("contactMsg");
  if (!name || !msg) {
    out.style.color = "#c0392b";
    out.textContent = "이름과 내용을 모두 입력해주세요.";
    return;
  }
  out.style.color = "";
  out.textContent = "문의가 접수되었어요. 감사합니다!";
  $("c_name").value = "";
  $("c_msg").value = "";
});