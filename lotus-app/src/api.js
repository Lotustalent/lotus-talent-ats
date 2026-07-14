async function sbFetch(path, method = "GET", body = null, prefer = "return=representation") {
  const opts = { method, headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json", "Prefer": prefer } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(SB_URL + "/rest/v1/" + path, opts);
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function loadCandidates() {
  const rows = await sbFetch("candidates?order=created_at.desc");
  function parseJ(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "string") { try { return JSON.parse(v); } catch(e) { return []; } }
    return [];
  }
  return rows.map(r => ({
    id: r.id, name: r.name||"", gender: r.gender||"", nationality: r.nationality||"",
    visaStatus: r.visa_status||"", visaExpiry: r.visa_expiry||"",
    email: r.email||"", phone: r.phone||"", location: r.location||"",
    desiredSalary: r.desired_salary||"", availability: r.availability||"",
    noticePeriod: r.notice_period||"",
    currentRole: r.job_title||"", currentCompany: r.current_company||"",
    languages: parseJ(r.languages), skills: parseJ(r.skills),
    softwareSkills: parseJ(r.software_skills), softSkills: parseJ(r.soft_skills),
    education: parseJ(r.education), experience: parseJ(r.experience),
    status: r.status||"New", source: r.source||"", addedDate: r.added_date||"", notes: r.notes||""
  }));
}

async function saveCandidate(c) {
  const row = {
    id: c.id, name: c.name, gender: c.gender, nationality: c.nationality,
    visa_status: c.visaStatus, visa_expiry: c.visaExpiry,
    email: c.email, phone: c.phone, location: c.location,
    desired_salary: c.desiredSalary, availability: c.availability,
    notice_period: c.noticePeriod,
    job_title: c.currentRole, current_company: c.currentCompany,
    languages: c.languages || [], skills: c.skills || [],
    software_skills: c.softwareSkills || [], soft_skills: c.softSkills || [],
    education: c.education || [], experience: c.experience || [],
    status: c.status, source: c.source, added_date: c.addedDate, notes: c.notes
  };
  await sbFetch("candidates?on_conflict=id", "POST", row, "resolution=merge-duplicates,return=representation");
}

async function loadClients() {
  const rows = await sbFetch("clients?order=created_at.desc");
  return rows.map(r => ({
    id: r.id, company: r.company, industry: r.industry, origin: r.origin,
    hqCountry: r.hq_country, localOffice: r.local_office, status: r.status,
    feeAgreed: r.fee_agreed, feeSignedDate: r.fee_signed_date,
    contactName: r.contact_name, contactTitle: r.contact_title,
    contactEmail: r.contact_email, contactPhone: r.contact_phone,
    openRoles: r.open_roles, notes: r.notes, addedDate: r.added_date,
    documents: r.documents || []
  }));
}

async function loadJobs() {
  const rows = await sbFetch("jobs?order=created_at.desc");
  return rows.map(r => ({
    id: r.id, title: r.title, jobId: r.job_id,
    clientId: r.client_id, clientName: r.client_name,
    location: r.location, contractType: r.contract_type,
    salaryMin: r.salary_min, salaryMax: r.salary_max,
    benefits: r.benefits, targetStart: r.target_start,
    languages: r.languages || [], description: r.description,
    requirements: r.requirements, niceToHave: r.nice_to_have,
    notes: r.notes, status: r.status || "Open",
    dateOpened: r.date_opened, dateClosed: r.date_closed,
    pipeline: r.pipeline || [],
    createdAt: r.created_at
  }));
}

async function saveJob(j) {
  const row = {
    id: j.id, title: j.title, job_id: j.jobId,
    client_id: j.clientId, client_name: j.clientName,
    location: j.location, contract_type: j.contractType,
    salary_min: j.salaryMin, salary_max: j.salaryMax,
    benefits: j.benefits, target_start: j.targetStart,
    languages: j.languages || [], description: j.description,
    requirements: j.requirements, nice_to_have: j.niceToHave,
    notes: j.notes, status: j.status || "Open",
    date_opened: j.dateOpened, date_closed: j.dateClosed,
    pipeline: j.pipeline || []
  };
  await sbFetch("jobs?on_conflict=id", "POST", row, "resolution=merge-duplicates,return=representation");
}

async function saveClient(c) {
  const row = {
    id: c.id, company: c.company, industry: c.industry, origin: c.origin,
    hq_country: c.hqCountry, local_office: c.localOffice, status: c.status,
    fee_agreed: c.feeAgreed, fee_signed_date: c.feeSignedDate,
    contact_name: c.contactName, contact_title: c.contactTitle,
    contact_email: c.contactEmail, contact_phone: c.contactPhone,
    open_roles: c.openRoles, notes: c.notes, added_date: c.addedDate,
    documents: c.documents || []
  };
  await sbFetch("clients?on_conflict=id", "POST", row, "resolution=merge-duplicates,return=representation");
}

export { sbFetch, loadCandidates, saveCandidate, loadClients, saveClient, loadJobs, saveJob };