export function buildSubmission({ student, grading, answers }) {
  return {
    name: String(student?.name || '').trim(),
    studentClass: String(student?.studentClass || '').trim(),
    studentNo: String(student?.studentNo || '').trim(),
    score: grading.score,
    total: grading.total,
    percentage: grading.percentage,
    passed: grading.passed,
    answers: { ...answers }
  };
}

export async function saveSubmission(env, payload, fetchImpl = fetch) {
  const url = env?.SHEET_WEBHOOK_URL;
  if (!url) throw new Error('ยังไม่ได้ตั้งค่า SHEET_WEBHOOK_URL');

  const body = {
    ...payload,
    token: env?.SHEET_WEBHOOK_TOKEN || ''
  };

  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow'
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { ok: response.ok }; }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'บันทึกข้อมูลลง Google Sheet ไม่สำเร็จ');
  }
  return data;
}

export async function fetchStudents(env, studentClass, fetchImpl = fetch) {
  const webhookUrl = env?.SHEET_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('ยังไม่ได้ตั้งค่า SHEET_WEBHOOK_URL');
  const cls = String(studentClass || '').trim();
  if (!cls) throw new Error('กรุณาระบุชั้นเรียน');

  const url = new URL(webhookUrl);
  url.searchParams.set('action', 'students');
  url.searchParams.set('class', cls);
  if (env?.SHEET_WEBHOOK_TOKEN) url.searchParams.set('token', env.SHEET_WEBHOOK_TOKEN);

  const response = await fetchImpl(url.toString(), {
    method: 'GET',
    redirect: 'follow',
    headers: { 'accept': 'application/json' }
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { ok: false, error: 'ข้อมูลรายชื่อนักเรียนไม่ถูกต้อง' }; }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'โหลดรายชื่อนักเรียนไม่สำเร็จ');
  }
  return data;
}
