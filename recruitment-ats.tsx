import { useState, useRef } from "react";

const T = {
  navy: "#1a2744", indigo: "#2d4a8a", sky: "#4a7fc1", vermil: "#c84b2f",
  ivory: "#f8f6f1", sand: "#ede9e0", mist: "#e8edf5", ink: "#1a1a2e",
  slate: "#5a6480", silver: "#9aa3b8", white: "#ffffff", green: "#2a7d4f", amber: "#c47d0a",
};

const STATUS_COLORS = {
  "New":            { bg: "#e8edf5", text: "#2d4a8a" },
  "Screening":      { bg: "#fef3e2", text: "#8a5a00" },
  "Shortlisted":    { bg: "#e8f5ee", text: "#2a7d4f" },
  "Sent to Client": { bg: "#f0ebff", text: "#5a2d9a" },
  "Placed":         { bg: "#d4edda", text: "#155724" },
  "On Hold":        { bg: "#f5f5f5", text: "#5a6480" },
  "Not Suitable":   { bg: "#fde8e8", text: "#7a1f1f" },
};

const SAMPLE = [{
  id: "c001", name: "Yuki Tanaka", gender: "Female", nationality: "Japanese",
  visaStatus: "Highly Skilled Migrant", visaExpiry: "2026-09-30",
  email: "y.tanaka@email.com", phone: "+31 6 12345678", location: "Amsterdam",
  desiredSalary: "€65,000", availability: "2026-08-01",
  currentRole: "Marketing Manager", currentCompany: "Sony Europe",
  languages: ["Japanese (Native)", "English (Fluent)", "Dutch (Basic)"],
  skills: ["Brand Strategy", "Digital Marketing", "Japanese B2B"],
  status: "Shortlisted", source: "LinkedIn", addedDate: "2026-06-10",
  notes: "Strong cultural fit. Available Tues/Thurs.",
  education: [{ degree: "BA International Business", school: "Waseda University", year: "2015" }],
  experience: [{
    role: "Marketing Manager", company: "Sony Europe", start: "2020-04", end: "Present",
    description: "Led pan-European campaigns for consumer electronics.",
    reasonLeaving: "Seeking growth and management role"
  }, {
    role: "Marketing Coordinator", company: "Mitsui & Co.", start: "2017-06", end: "2020-03",
    description: "Coordinated trade marketing across Benelux.",
    reasonLeaving: "Promoted to Sony role"
  }]
}];

function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().slice(0, 10); }

function Badge({ status }) {
  const c = STATUS_COLORS[status] || { bg: T.mist, text: T.slate };
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small }) {
  const variants = {
    primary: { background: T.navy, color: T.white, border: "none" },
    accent:  { background: T.vermil, color: T.white, border: "none" },
    ghost:   { background: "transparent", color: T.slate, border: `1px solid ${T.sand}` },
    success: { background: T.green, color: T.white, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "Inter, sans-serif", fontWeight: 600, opacity: disabled ? 0.5 : 1,
      padding: small ? "5px 12px" : "9px 18px", fontSize: small ? 12 : 13,
    }}>{children}</button>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, as = "input", rows = 3, options }) {
  const style = {
    width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 13, color: T.ink,
    border: `1px solid ${T.sand}`, background: T.white, boxSizing: "border-box",
    fontFamily: "Inter, sans-serif", outline: "none", marginTop: 4,
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: T.slate, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      {as === "textarea" && <textarea value={value || ""} rows={rows} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ ...style, resize: "vertical" }} />}
      {as === "select" && (
        <select value={value || ""} onChange={e => onChange(e.target.value)} style={style}>
          {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {as === "input" && <input type={type} value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={style} />}
    </div>
  );
}

function SectionHead({ title }) {
  return <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${T.mist}`, paddingBottom: 6, marginBottom: 14, marginTop: 20 }}>{title}</div>;
}

const EXTRACTION_PROMPT = `Extract ALL candidate info from this CV and return ONLY a JSON object — no markdown, no explanation.

Use this exact structure:
{
  "name": "", "gender": "", "nationality": "", "visaStatus": "", "visaExpiry": "",
  "email": "", "phone": "", "location": "", "desiredSalary": "", "availability": "",
  "currentRole": "", "currentCompany": "",
  "languages": [], "skills": [],
  "education": [{ "degree": "", "school": "", "year": "" }],
  "experience": [{ "role": "", "company": "", "start": "", "end": "", "description": "", "reasonLeaving": "" }],
  "notes": ""
}
Return ONLY the JSON. Nothing else.`;

export default function App() {
  const [view, setView] = useState("list");
  const [candidates, setCandidates] = useState(SAMPLE);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [sheetKey, setSheetKey] = useState("");
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setExp(i, key, val) { setForm(f => ({ ...f, experience: f.experience.map((e, j) => j === i ? { ...e, [key]: val } : e) })); }
  function setEdu(i, key, val) { setForm(f => ({ ...f, education: f.education.map((e, j) => j === i ? { ...e, [key]: val } : e) })); }

  async function handleFile(file) {
    if (!file) return;
    if (!apiKey) { notify("Add your Anthropic API key in Settings first", "err"); setView("settings"); return; }
    setUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const isPdf = file.type === "application/pdf";
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: isPdf ? [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: EXTRACTION_PROMPT }
          ] : [{ type: "text", text: EXTRACTION_PROMPT + "\n\nNote: This was a Word document. Extract all text content from it." }] }]
        })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const extracted = JSON.parse(clean);
      setForm({ id: uid(), ...extracted, status: "New", source: "Upload", addedDate: today(), cvFile: file.name });
      setView("edit");
      notify("CV extracted — please review and save");
    } catch (err) {
      console.error(err);
      setForm({ id: uid(), status: "New", source: "Upload", addedDate: today(), cvFile: file?.name, education: [], experience: [], languages: [], skills: [] });
      setView("edit");
      notify("Extraction failed — fill in manually. Check API key in Settings.", "err");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    if (!form?.name) { notify("Name is required", "err"); return; }
    setCandidates(prev => prev.find(c => c.id === form.id) ? prev.map(c => c.id === form.id ? form : c) : [form, ...prev]);
    notify(form.name + " saved");
    setView("list");
  }

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return (!q || [c.name, c.currentRole, c.currentCompany].some(v => v?.toLowerCase().includes(q)))
      && (filterStatus === "All" || c.status === filterStatus);
  });

  // ── HEADER ──
  const Header = () => (
    <div style={{ background: T.navy, color: T.white, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, background: T.vermil, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900 }}>🪷</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Lotus Talent Consultancy</div>
          <div style={{ fontSize: 9, color: T.silver, letterSpacing: "0.08em" }}>CANDIDATE TRACKER</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["list","📋 Candidates"],["settings","⚙ Settings"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{ background: view === v ? T.indigo : "transparent", color: T.white, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: T.ivory, minHeight: "100vh", color: T.ink }}>
      <Header />

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: toast.type === "err" ? T.vermil : T.green, color: T.white, padding: "11px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* ── LIST ── */}
      {view === "list" && (
        <div style={{ padding: 24, maxWidth: 1080, margin: "0 auto" }}>
          {/* Upload zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${T.sky}`, borderRadius: 10, padding: "22px 20px", textAlign: "center", marginBottom: 20, cursor: "pointer", background: uploading ? T.mist : T.white }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {uploading ? (
              <div><div style={{ fontSize: 24 }}>⏳</div><div style={{ color: T.indigo, fontWeight: 700, marginTop: 6 }}>Extracting CV with AI…</div></div>
            ) : apiKey ? (
              <div><div style={{ fontSize: 24 }}>📄</div><div style={{ color: T.navy, fontWeight: 700, marginTop: 6 }}>Drop CV here or click to upload</div><div style={{ color: T.slate, fontSize: 12, marginTop: 3 }}>PDF or Word — AI extracts all fields automatically</div></div>
            ) : (
              <div><div style={{ fontSize: 24 }}>⚙️</div><div style={{ color: T.vermil, fontWeight: 700, marginTop: 6 }}>API key needed</div><div style={{ color: T.slate, fontSize: 12, marginTop: 3 }}>Go to Settings → add your Anthropic API key to enable CV extraction</div></div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates…"
              style={{ flex: 1, minWidth: 180, padding: "7px 12px", borderRadius: 6, border: `1px solid ${T.sand}`, fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none" }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${T.sand}`, fontSize: 13, fontFamily: "Inter, sans-serif", background: T.white }}>
              <option>All</option>
              {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>
            <Btn onClick={() => { setForm({ id: uid(), status: "New", source: "Manual", addedDate: today(), education: [], experience: [], languages: [], skills: [] }); setView("edit"); }}>+ Add Manually</Btn>
          </div>

          {/* Status pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => {
              const n = candidates.filter(x => x.status === s).length;
              return n > 0 ? <span key={s} style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s}: {n}</span> : null;
            })}
          </div>

          {/* Table */}
          <div style={{ background: T.white, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.navy, color: T.white }}>
                  {["Candidate", "Current Role", "Nationality / Visa", "Desired Salary", "Available", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: T.slate }}>No candidates yet — upload a CV or add manually</td></tr>
                )}
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? T.white : T.ivory, borderBottom: `1px solid ${T.sand}` }}>
                    <td style={{ padding: "10px 14px" }}><div style={{ fontWeight: 700, color: T.navy }}>{c.name}</div><div style={{ fontSize: 11, color: T.slate }}>{c.source} · {c.addedDate}</div></td>
                    <td style={{ padding: "10px 14px" }}><div>{c.currentRole}</div><div style={{ fontSize: 11, color: T.slate }}>{c.currentCompany}</div></td>
                    <td style={{ padding: "10px 14px" }}><div>{c.nationality}</div><div style={{ fontSize: 11, color: T.slate }}>{c.visaStatus}</div></td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{c.desiredSalary || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>{c.availability || "—"}</td>
                    <td style={{ padding: "10px 14px" }}><Badge status={c.status} /></td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small variant="ghost" onClick={() => { setForm({ ...c }); setView("edit"); }}>Edit</Btn>
                        <Btn small onClick={() => { setSelected(c); setView("cv"); }}>CV</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ color: T.silver, fontSize: 11, marginTop: 8, textAlign: "right" }}>{filtered.length} candidate{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {/* ── EDIT / ADD FORM ── */}
      {view === "edit" && form && (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Btn variant="ghost" small onClick={() => { setView("list"); setForm(null); }}>← Back</Btn>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.navy }}>{form.name ? `Edit: ${form.name}` : "New Candidate"}</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* LEFT */}
            <div>
              <SectionHead title="Personal Information" />
              <Field label="Full Name *" value={form.name} onChange={v => setF("name", v)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Gender" as="select" value={form.gender} onChange={v => setF("gender", v)} options={["", "Male", "Female", "Non-binary", "Prefer not to say"]} />
                <Field label="Nationality" value={form.nationality} onChange={v => setF("nationality", v)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Visa Status" value={form.visaStatus} onChange={v => setF("visaStatus", v)} placeholder="HSM, EU Citizen…" />
                <Field label="Visa Expiry" type="date" value={form.visaExpiry} onChange={v => setF("visaExpiry", v)} />
              </div>
              <Field label="Location" value={form.location} onChange={v => setF("location", v)} placeholder="Amsterdam" />

              <SectionHead title="Contact (Internal Only)" />
              <Field label="Email" type="email" value={form.email} onChange={v => setF("email", v)} />
              <Field label="Phone" value={form.phone} onChange={v => setF("phone", v)} />

              <SectionHead title="Preferences" />
              <Field label="Desired Annual Salary" value={form.desiredSalary} onChange={v => setF("desiredSalary", v)} placeholder="€65,000" />
              <Field label="Availability" value={form.availability} onChange={v => setF("availability", v)} placeholder="Immediate / 2026-09-01" />

              <SectionHead title="Tracking" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Status" as="select" value={form.status} onChange={v => setF("status", v)} options={Object.keys(STATUS_COLORS)} />
                <Field label="Source" as="select" value={form.source} onChange={v => setF("source", v)} options={["LinkedIn", "Email", "Website", "Referral", "Upload", "Manual"]} />
              </div>
              <Field label="Recruiter Notes (Internal)" as="textarea" value={form.notes} onChange={v => setF("notes", v)} placeholder="Interview impressions, follow-ups…" rows={3} />
            </div>

            {/* RIGHT */}
            <div>
              <SectionHead title="Current Position" />
              <Field label="Job Title" value={form.currentRole} onChange={v => setF("currentRole", v)} />
              <Field label="Company" value={form.currentCompany} onChange={v => setF("currentCompany", v)} />

              <SectionHead title="Languages & Skills" />
              <Field label="Languages (one per line)" as="textarea" value={(form.languages || []).join("\n")} onChange={v => setF("languages", v.split("\n").filter(Boolean))} rows={3} placeholder={"Japanese (Native)\nEnglish (Fluent)"} />
              <Field label="Skills (one per line)" as="textarea" value={(form.skills || []).join("\n")} onChange={v => setF("skills", v.split("\n").filter(Boolean))} rows={3} />

              <SectionHead title="Education" />
              {(form.education || []).map((edu, i) => (
                <div key={i} style={{ background: T.mist, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <Field label="Degree" value={edu.degree} onChange={v => setEdu(i, "degree", v)} />
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
                    <Field label="Institution" value={edu.school} onChange={v => setEdu(i, "school", v)} />
                    <Field label="Year" value={edu.year} onChange={v => setEdu(i, "year", v)} />
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, education: f.education.filter((_, j) => j !== i) }))} style={{ fontSize: 11, color: T.vermil, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                </div>
              ))}
              <Btn small variant="ghost" onClick={() => setForm(f => ({ ...f, education: [...(f.education || []), { degree: "", school: "", year: "" }] }))}>+ Education</Btn>

              <SectionHead title="Work Experience" />
              {(form.experience || []).map((exp, i) => (
                <div key={i} style={{ background: T.mist, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Field label="Title" value={exp.role} onChange={v => setExp(i, "role", v)} />
                    <Field label="Company" value={exp.company} onChange={v => setExp(i, "company", v)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Field label="Start (YYYY-MM)" value={exp.start} onChange={v => setExp(i, "start", v)} />
                    <Field label="End" value={exp.end} onChange={v => setExp(i, "end", v)} placeholder="Present" />
                  </div>
                  <Field label="Responsibilities" as="textarea" value={exp.description} onChange={v => setExp(i, "description", v)} rows={2} />
                  <Field label="Reason for Leaving" value={exp.reasonLeaving} onChange={v => setExp(i, "reasonLeaving", v)} placeholder="Seeking growth…" />
                  <button onClick={() => setForm(f => ({ ...f, experience: f.experience.filter((_, j) => j !== i) }))} style={{ fontSize: 11, color: T.vermil, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                </div>
              ))}
              <Btn small variant="ghost" onClick={() => setForm(f => ({ ...f, experience: [...(f.experience || []), { role: "", company: "", start: "", end: "", description: "", reasonLeaving: "" }] }))}>+ Experience</Btn>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.sand}` }}>
            <Btn variant="ghost" onClick={() => { setView("list"); setForm(null); }}>Cancel</Btn>
            <Btn variant="success" onClick={save}>Save Candidate</Btn>
            {form.name && (
              <Btn variant="accent" onClick={() => { save(); const c = form; setTimeout(() => { setSelected(c); setView("cv"); }, 100); }}>Save & Generate CV</Btn>
            )}
          </div>
        </div>
      )}

      {/* ── CLIENT CV ── */}
      {view === "cv" && selected && (
        <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }} className="no-print">
            <Btn variant="ghost" small onClick={() => setView("list")}>← Back</Btn>
            <span style={{ fontWeight: 700, color: T.navy }}>Client CV — {selected.name}</span>
            <div style={{ marginLeft: "auto" }}><Btn onClick={() => window.print()}>🖨 Print / Save PDF</Btn></div>
          </div>
          <div className="no-print" style={{ background: T.mist, borderRadius: 8, padding: "9px 14px", marginBottom: 14, fontSize: 12, color: T.slate }}>
            Print → "Save as PDF" to get a PDF file.
          </div>

          <div style={{ background: T.white, borderRadius: 10, boxShadow: "0 2px 20px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ background: T.navy, color: T.white, padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: T.vermil, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900 }}>🪷</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Lotus Talent Consultancy</div>
                  <div style={{ fontSize: 10, color: T.silver, letterSpacing: "0.08em" }}>ASIAN SPECIALIST · NETHERLANDS</div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: T.silver }}>
                <div>Candidate Profile · Confidential</div><div>{today()}</div>
              </div>
            </div>

            <div style={{ background: T.indigo, color: T.white, padding: "16px 30px" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: "#a8bfdf", marginTop: 2 }}>{selected.currentRole}{selected.currentCompany ? ` · ${selected.currentCompany}` : ""}</div>
            </div>

            <div style={{ padding: "22px 30px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
                {[["Nationality", selected.nationality], ["Gender", selected.gender], ["Visa Status", selected.visaStatus], ["Visa Expiry", selected.visaExpiry], ["Desired Salary", selected.desiredSalary], ["Available From", selected.availability]].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} style={{ background: T.mist, borderRadius: 7, padding: "9px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.slate, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.languages?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `2px solid ${T.mist}`, paddingBottom: 5, marginBottom: 9 }}>Languages</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {selected.languages.map(l => <span key={l} style={{ background: T.navy, color: T.white, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{l}</span>)}
                  </div>
                </div>
              )}

              {selected.skills?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `2px solid ${T.mist}`, paddingBottom: 5, marginBottom: 9 }}>Key Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {selected.skills.map(s => <span key={s} style={{ background: T.sand, color: T.navy, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                  </div>
                </div>
              )}

              {selected.education?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `2px solid ${T.mist}`, paddingBottom: 5, marginBottom: 10 }}>Education</div>
                  {selected.education.map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < selected.education.length - 1 ? `1px solid ${T.sand}` : "none" }}>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.degree}</div><div style={{ fontSize: 12, color: T.slate }}>{e.school}</div></div>
                      <div style={{ fontSize: 12, color: T.slate }}>{e.year}</div>
                    </div>
                  ))}
                </div>
              )}

              {selected.experience?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `2px solid ${T.mist}`, paddingBottom: 5, marginBottom: 12 }}>Work Experience</div>
                  {selected.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < selected.experience.length - 1 ? `1px solid ${T.sand}` : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div><div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{exp.role}</div><div style={{ fontSize: 13, color: T.indigo, fontWeight: 600 }}>{exp.company}</div></div>
                        <div style={{ fontSize: 11, color: T.slate, background: T.mist, borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap" }}>{exp.start} – {exp.end || "Present"}</div>
                      </div>
                      {exp.description && <div style={{ fontSize: 12, color: T.slate, marginTop: 5, lineHeight: 1.6 }}>{exp.description}</div>}
                      {exp.reasonLeaving && (
                        <div style={{ marginTop: 7, fontSize: 11, background: "#fff8e8", borderLeft: `3px solid ${T.amber}`, padding: "4px 9px", borderRadius: "0 4px 4px 0", color: "#7a5000" }}>
                          <strong>Reason for leaving: </strong>{exp.reasonLeaving}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selected.notes && (
                <div style={{ background: T.mist, borderRadius: 7, padding: "11px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Additional Notes</div>
                  <div style={{ fontSize: 12, color: T.slate, lineHeight: 1.6 }}>{selected.notes}</div>
                </div>
              )}
            </div>

            <div style={{ background: T.sand, padding: "10px 30px", display: "flex", justifyContent: "space-between", fontSize: 10, color: T.silver }}>
              <span>Presented by Lotus Talent Consultancy · Confidential</span>
              <span>Prepared exclusively for client review</span>
            </div>
          </div>
          <style>{`@media print { .no-print { display: none !important; } }`}</style>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {view === "settings" && (
        <div style={{ padding: 24, maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ color: T.navy, marginBottom: 4 }}>Settings</h2>
          <p style={{ color: T.slate, fontSize: 13, marginBottom: 20 }}>Configure AI extraction and Google Sheets sync.</p>

          <div style={{ background: T.white, borderRadius: 10, padding: 22, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 16 }}>
            <SectionHead title="🤖 Anthropic API Key (Required for CV extraction)" />
            <div style={{ background: "#fff8e8", borderRadius: 7, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: "#7a5000", lineHeight: 1.6, borderLeft: `3px solid ${T.amber}` }}>
              Get your free key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: T.indigo }}>console.anthropic.com</a>. Each CV extraction costs ~€0.02. Key is stored in your browser only.
            </div>
            <Field label="API Key" value={apiKey} onChange={v => setApiKey(v)} placeholder="sk-ant-..." />
            {apiKey && <div style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>✓ API key set — CV extraction ready</div>}
          </div>

          <div style={{ background: T.white, borderRadius: 10, padding: 22, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 16 }}>
            <SectionHead title="📊 Google Sheets Sync (Optional)" />
            <div style={{ background: T.mist, borderRadius: 7, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: T.slate, lineHeight: 1.6 }}>
              Create a Google Sheet, enable the Sheets API in Google Cloud Console, and paste your credentials below.
            </div>
            <Field label="Spreadsheet ID" value={sheetId} onChange={v => setSheetId(v)} placeholder="From sheet URL: /spreadsheets/d/[ID]/edit" />
            <Field label="Google API Key" value={sheetKey} onChange={v => setSheetKey(v)} placeholder="AIza..." />
          </div>

          <div style={{ background: T.white, borderRadius: 10, padding: 22, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 16 }}>
            <SectionHead title="⬇ Export Candidates" />
            <p style={{ color: T.slate, fontSize: 12, marginBottom: 12 }}>Download all candidates as CSV for backup.</p>
            <Btn onClick={() => {
              const headers = ["ID","Name","Gender","Nationality","Visa","Salary","Available","Role","Company","Email","Phone","Location","Status","Source","Added","Languages","Skills","Notes"];
              const rows = candidates.map(c => [c.id,c.name,c.gender,c.nationality,c.visaStatus,c.desiredSalary,c.availability,c.currentRole,c.currentCompany,c.email,c.phone,c.location,c.status,c.source,c.addedDate,(c.languages||[]).join("; "),(c.skills||[]).join("; "),c.notes].map(v => `"${(v||"").replace(/"/g,'""')}"`));
              const csv = [headers,...rows].map(r => r.join(",")).join("\n");
              const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "lotus_candidates.csv"; a.click();
            }}>⬇ Download CSV</Btn>
          </div>

          <Btn variant="success" onClick={() => notify("Settings saved")}>Save Settings</Btn>
        </div>
      )}
    </div>
  );
}
