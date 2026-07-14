const PROMPT = "Extract ALL candidate info from this CV and return ONLY a JSON object — no markdown, no explanation. " +
  "Use this exact structure: " +
  '{"name":"","gender":"","nationality":"","visaStatus":"","visaExpiry":"","email":"","phone":"","location":"","desiredSalary":"","availability":"","noticePeriod":"","currentRole":"","currentCompany":"","languages":[],"skills":[],"softwareSkills":[],"softSkills":[],"education":[{"degree":"","school":"","year":""}],"experience":[{"role":"","company":"","start":"","end":"","description":"","reasonLeaving":""}],"notes":""}' +
  " For softwareSkills: extract specific tools, software, platforms (e.g. Python, Salesforce, SAP, Excel, Power BI). " +
  " For softSkills: extract interpersonal/professional skills (e.g. stakeholder management, communication, leadership). " +
  " For skills: leave empty. For noticePeriod: extract if mentioned (e.g. 1 month, 2 months, Immediate). " +
  " Return ONLY the JSON. Nothing else.";

async function rewriteExperience(experience, apiKey) {
  if (!apiKey || !experience || experience.length === 0) return experience;
  const expText = experience.map((e, i) => "Role " + (i+1) + ": " + e.role + " at " + e.company + "\nDescription: " + (e.description || "")).join("\n\n");
  const systemMsg = "You are a professional CV writer. Rewrite the work experience descriptions into clear bullet points. Rules: Convert each into 3-5 bullet points starting with action verbs. Fix grammar. Keep facts accurate. Return ONLY a JSON array: [{index:0,bullets:[...]},{index:1,bullets:[...]}]";
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 2000,
      messages: [{ role: "user", content: systemMsg + "\n\nExperience to rewrite:\n" + expText }]
    })
  });
  const data = await resp.json();
  if (data.error) return experience;
  const raw = (data.content||[]).map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
  const rewrites = JSON.parse(raw);
  return experience.map((e, i) => {
    const rewrite = rewrites.find(r => r.index === i);
    return rewrite ? { ...e, bullets: rewrite.bullets, description: "" } : e;
  });
}

export { rewriteExperience };