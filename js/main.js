// ===== ?붿냼 李몄“ =====
const $ = (id) => document.getElementById(id);
const bmiBox = $("bmiBox");
const resultBox = $("result");

// ===== BMI ?ㅼ떆媛?怨꾩궛 =====
function calcBMI() {
  const h = parseFloat($("height").value);
  const w = parseFloat($("weight").value);
  const t = parseFloat($("target").value);

  if (!h || !w) { bmiBox.innerHTML = ""; return; }

  const bmi = w / ((h / 100) ** 2);
  let msg = `?꾩옱 BMI: <b>${bmi.toFixed(1)}</b> (${bmiLabel(bmi)})`;

  // 紐⑺몴 BMI媛 ?泥댁쨷?대㈃ 寃쎄퀬
  if (t) {
    const targetBmi = t / ((h / 100) ** 2);
    msg += `<br />紐⑺몴 BMI: <b>${targetBmi.toFixed(1)}</b> (${bmiLabel(targetBmi)})`;
    if (targetBmi < 18.5) {
      msg += `<br /><span class="warn">??紐⑺몴 泥댁쨷???泥댁쨷 踰붿쐞?덉슂. ??嫄닿컯??紐⑺몴瑜?沅뚯옣?댁슂.</span>`;
    }
  }
  bmiBox.innerHTML = msg;
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return "?泥댁쨷";
  if (bmi < 23) return "?뺤긽";
  if (bmi < 25) return "怨쇱껜以?;
  return "鍮꾨쭔";
}

["height", "weight", "target"].forEach((id) =>
  $(id).addEventListener("input", calcBMI)
);

// ===== 怨쇰룄??媛먮웾 ?띾룄 寃利?=====
function checkPace(w, t, weeks) {
  const lossPerWeek = (w - t) / weeks;      // 二쇰떦 媛먮웾 kg
  const maxPerWeek = w * 0.01;              // 二쇰떦 ?꾩옱 泥댁쨷??1%
  return { lossPerWeek, maxPerWeek, tooFast: lossPerWeek > maxPerWeek };
}

// ===== ?뚮옖 ?앹꽦 =====
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

  // 1) 鍮??낅젰 寃利?  if (!data.height || !data.weight || !data.target || !data.weeks) {
    resultBox.innerHTML = `<span class="err">?ㅒ룹껜以뫢룸ぉ??泥댁쨷쨌湲곌컙??紐⑤몢 ?낅젰?댁＜?몄슂.</span>`;
    return;
  }
  if (data.target >= data.weight) {
    resultBox.innerHTML = `<span class="err">紐⑺몴 泥댁쨷? ?꾩옱 泥댁쨷蹂대떎 ??븘???댁슂.</span>`;
    return;
  }

  // 2) 怨쇰룄??媛먮웾 ?띾룄 寃쎄퀬 (吏꾪뻾? ?쒗궎??寃쎄퀬 ?ы븿)
  const pace = checkPace(data.weight, data.target, data.weeks);
  const targetBmi = data.target / ((data.height / 100) ** 2);
  if (targetBmi < 18.5) {
    resultBox.innerHTML = `<span class="err">紐⑺몴 泥댁쨷???泥댁쨷 踰붿쐞?덉슂. 湲곌컙???섎━嫄곕굹 紐⑺몴瑜?議곗젙??二쇱꽭??</span>`;
    return;
  }
  if (pace.tooFast) {
    resultBox.innerHTML =
      `<span class="err">嫄닿컯??媛먮웾 ?띾룄(二쇰떦 ??${pace.maxPerWeek.toFixed(1)}kg)瑜?珥덇낵?덉뼱?? ` +
      `?꾩옱 怨꾪쉷? 二쇰떦 ${pace.lossPerWeek.toFixed(1)}kg 媛먮웾?댁뿉?? 湲곌컙???섎젮二쇱꽭??</span>`;
    return;
  }

  // 3) API ?몄텧 (吏????꾩븘??+ ?ㅻ쪟 泥섎━)
  resultBox.innerHTML = `<span class="loading">AI媛 ?뚮옖??留뚮뱾怨??덉뼱??.. ??/span>`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 30珥???꾩븘??
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
      try { const j = await res.json(); detail = j.error ? " ??" + j.error : ""; } catch (e) {}
      resultBox.innerHTML = `<span class="err">?ㅻ쪟媛 諛쒖깮?덉뼱??(${res.status})${detail}</span>`;
      return;
    }

    const json = await res.json();
    resultBox.textContent = json.plan || "寃곌낵瑜?諛쏆? 紐삵뻽?댁슂.";
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      resultBox.innerHTML = `<span class="err">?묐떟??吏?곕릺怨??덉뼱?? ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.</span>`;
    } else {
      resultBox.innerHTML = `<span class="err">?ㅽ듃?뚰겕 ?ㅻ쪟媛 諛쒖깮?덉뼱?? ?ㅼ떆 ?쒕룄?댁＜?몄슂.</span>`;
    }
  }
});

// ===== 臾몄쓽 ??(?꾨줎???곕え) =====
$("contactBtn").addEventListener("click", () => {
  const name = $("c_name").value.trim();
  const msg = $("c_msg").value.trim();
  const out = $("contactMsg");
  if (!name || !msg) {
    out.style.color = "#c0392b";
    out.textContent = "?대쫫怨??댁슜??紐⑤몢 ?낅젰?댁＜?몄슂.";
    return;
  }
  out.style.color = "";
  out.textContent = "臾몄쓽媛 ?묒닔?섏뿀?댁슂. 媛먯궗?⑸땲??";
  $("c_name").value = "";
  $("c_msg").value = "";
});
