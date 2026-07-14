import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function Settings(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="settings"&&(
        <div style={{padding:24,maxWidth:580,margin:"0 auto"}}>
          <h2 style={{color:T.navy,marginBottom:4,fontWeight:800}}>Settings</h2>
          <p style={{color:T.slate,fontSize:13,marginBottom:20}}>Configure AI extraction and export.</p>
          <div style={{background:T.white,borderRadius:10,padding:22,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:16}}>
            <SH title="🗄 Database"/>
            <div style={{background:"#e8f5ee",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#1a5c30",lineHeight:1.6}}>
              ✓ Connected to Supabase — all data is saved permanently and synced across devices.
            </div>
          </div>
          <div style={{background:T.white,borderRadius:10,padding:22,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:16}}>
            <SH title="🤖 Anthropic API Key (Required for CV extraction)"/>
            <div style={{background:"#fff8e8",borderRadius:7,padding:"9px 12px",marginBottom:12,fontSize:12,color:"#7a5000",lineHeight:1.6,borderLeft:`3px solid ${T.amber}`}}>
              Get your key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:T.indigo}}>console.anthropic.com</a>. ~€0.02 per CV. Saved in your browser.
            </div>
            <Field label="API Key" value={apiKey} onChange={v=>{setApiKey(v);localStorage.setItem("ltc_api_key",v);}} placeholder="sk-ant-..."/>
            {apiKey&&<div style={{color:T.green,fontSize:12,fontWeight:600}}>✓ API key set — CV extraction ready</div>}
          </div>
          <div style={{background:T.white,borderRadius:10,padding:22,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:16}}>
            <SH title="⬇ Export Data"/>
            <p style={{color:T.slate,fontSize:12,marginBottom:12}}>Download candidates or clients as CSV.</p>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>{
                const h=["ID","Name","Gender","Nationality","Visa","Salary","Available","Role","Company","Email","Phone","Location","Status","Source","Added","Languages","Skills","Notes"];
                const rows=candidates.map(c=>[c.id,c.name,c.gender,c.nationality,c.visaStatus,c.desiredSalary,c.availability,c.currentRole,c.currentCompany,c.email,c.phone,c.location,c.status,c.source,c.addedDate,(c.languages||[]).join("; "),(c.skills||[]).join("; "),c.notes].map(v=>`"${(v||"").replace(/"/g,'""')}"`));
                const csv=[h,...rows].map(r=>r.join(",")).join("\n");
                const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="lotus_candidates.csv";a.click();
              }}>⬇ Candidates CSV</Btn>
              <Btn variant="ghost" onClick={()=>{
                const h=["ID","Company","Industry","Origin","HQ","Office","Status","Fee","Signed","Contact","Title","Email","Phone","Open Roles","Notes","Added"];
                const rows=clients.map(c=>[c.id,c.company,c.industry,c.origin,c.hqCountry,c.localOffice,c.status,c.feeAgreed,c.feeSignedDate,c.contactName,c.contactTitle,c.contactEmail,c.contactPhone,c.openRoles,c.notes,c.addedDate].map(v=>`"${(v||"").replace(/"/g,'""')}"`));
                const csv=[h,...rows].map(r=>r.join(",")).join("\n");
                const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="lotus_clients.csv";a.click();
              }}>⬇ Clients CSV</Btn>
            </div>
          </div>
        </div>
    </>
  );
}
