import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function EditCandidate(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="editCandidate"&&form&&(
        <div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <Btn variant="ghost" small onClick={()=>{setView("candidates");setForm(null);}}>← Back</Btn>
            <h2 style={{margin:0,fontSize:17,fontWeight:800,color:T.navy}}>{form.name?`Edit: ${form.name}`:"New Candidate"}</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <SH title="Personal Information"/>
              <Field label="Full Name *" value={form.name} onChange={v=>setF("name",v)}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Gender" as="select" value={form.gender} onChange={v=>setF("gender",v)} options={["","Male","Female","Non-binary","Prefer not to say"]}/>
                <Field label="Nationality" value={form.nationality} onChange={v=>setF("nationality",v)}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Visa Status" value={form.visaStatus} onChange={v=>setF("visaStatus",v)} placeholder="HSM, EU Citizen…"/>
                <Field label="Visa Expiry" type="date" value={form.visaExpiry} onChange={v=>setF("visaExpiry",v)}/>
              </div>
              <Field label="Location" value={form.location} onChange={v=>setF("location",v)} placeholder="Amsterdam"/>
              <SH title="Contact (Internal Only)"/>
              <Field label="Email" type="email" value={form.email} onChange={v=>setF("email",v)}/>
              <Field label="Phone" value={form.phone} onChange={v=>setF("phone",v)}/>
              <SH title="Preferences"/>
              <Field label="Desired Annual Salary (gross)" value={form.desiredSalary} onChange={v=>setF("desiredSalary",v)} placeholder="€65,000"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Availability" value={form.availability} onChange={v=>setF("availability",v)} placeholder="Immediate / 2026-09-01"/>
                <Field label="Notice Period" value={form.noticePeriod} onChange={v=>setF("noticePeriod",v)} placeholder="1 month / Immediate"/>
              </div>
              <SH title="Tracking"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Status" as="select" value={form.status} onChange={v=>setF("status",v)} options={Object.keys(STATUS_COLORS)}/>
                <Field label="Source" as="select" value={form.source} onChange={v=>setF("source",v)} options={["LinkedIn","Email","Website","Referral","Upload","Manual"]}/>
              </div>
              <Field label="Recruiter Notes (Internal)" as="textarea" value={form.notes} onChange={v=>setF("notes",v)} placeholder="Interview impressions, follow-ups…" rows={3}/>
            </div>
            <div>
              <SH title="Current Position"/>
              <Field label="Job Title" value={form.currentRole} onChange={v=>setF("currentRole",v)}/>
              <Field label="Company" value={form.currentCompany} onChange={v=>setF("currentCompany",v)}/>
              <SH title="Languages"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8,maxHeight:180,overflowY:"auto",padding:"8px",background:"#f8f6f1",borderRadius:8,border:"1px solid #ede9e0"}}>
                {ALL_LANGUAGES.map(lang=>{
                  const sel=(form.languages||[]).includes(lang);
                  return <button key={lang} onClick={()=>setF("languages",sel?(form.languages||[]).filter(l=>l!==lang):[...(form.languages||[]),lang])}
                    style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid "+(sel?"#2d4a8a":"#ede9e0"),background:sel?"#2d4a8a":"white",color:sel?"white":"#5a6480"}}>{lang}</button>;
                })}
              </div>
              <SH title="Software & Tools"/>
              <Field label="Software skills (one per line)" as="textarea" value={(form.softwareSkills||[]).join("\n")} onChange={v=>setF("softwareSkills",v.split("\n").filter(Boolean))} rows={3} placeholder={"Python\nSalesforce\nPower BI"}/>
              <SH title="Soft Skills"/>
              <Field label="Soft skills (one per line)" as="textarea" value={(form.softSkills||[]).join("\n")} onChange={v=>setF("softSkills",v.split("\n").filter(Boolean))} rows={3} placeholder={"Stakeholder management\nLeadership\nCross-cultural communication"}/>
              <SH title="Education"/>
              {(form.education||[]).map((edu,i)=>(
                <div key={i} style={{background:T.mist,borderRadius:8,padding:12,marginBottom:8}}>
                  <Field label="Degree" value={edu.degree} onChange={v=>setEdu(i,"degree",v)}/>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
                    <Field label="Institution" value={edu.school} onChange={v=>setEdu(i,"school",v)}/>
                    <Field label="Year" value={edu.year} onChange={v=>setEdu(i,"year",v)}/>
                  </div>
                  <button onClick={()=>setForm(f=>({...f,education:f.education.filter((_,j)=>j!==i)}))} style={{fontSize:11,color:T.vermil,background:"none",border:"none",cursor:"pointer"}}>Remove</button>
                </div>
              ))}
              <Btn small variant="ghost" onClick={()=>setForm(f=>({...f,education:[...(f.education||[]),{degree:"",school:"",year:""}]}))}>+ Education</Btn>
              <SH title="Work Experience"/>
              {(form.experience||[]).map((exp,i)=>(
                <div key={i} style={{background:T.mist,borderRadius:8,padding:12,marginBottom:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <Field label="Title" value={exp.role} onChange={v=>setExp(i,"role",v)}/>
                    <Field label="Company" value={exp.company} onChange={v=>setExp(i,"company",v)}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <Field label="Start (YYYY-MM)" value={exp.start} onChange={v=>setExp(i,"start",v)}/>
                    <Field label="End" value={exp.end} onChange={v=>setExp(i,"end",v)} placeholder="Present"/>
                  </div>
                  <Field label="Responsibilities" as="textarea" value={exp.description} onChange={v=>setExp(i,"description",v)} rows={2}/>
                  <Field label="Reason for Leaving" value={exp.reasonLeaving} onChange={v=>setExp(i,"reasonLeaving",v)} placeholder="Seeking growth…"/>
                  <button onClick={()=>setForm(f=>({...f,experience:f.experience.filter((_,j)=>j!==i)}))} style={{fontSize:11,color:T.vermil,background:"none",border:"none",cursor:"pointer"}}>Remove</button>
                </div>
              ))}
              <Btn small variant="ghost" onClick={()=>setForm(f=>({...f,experience:[...(f.experience||[]),{role:"",company:"",start:"",end:"",description:"",reasonLeaving:""}]}))}>+ Experience</Btn>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:`1px solid ${T.sand}`}}>
            <Btn variant="ghost" onClick={()=>{setView("candidates");setForm(null);}}>Cancel</Btn>
            <Btn variant="success" onClick={handleSaveCandidate} disabled={saving}>{saving?"Saving…":"Save Candidate"}</Btn>
            {form.name&&<Btn variant="accent" onClick={async()=>{
  await handleSaveCandidate();
  const c=form;
  if(apiKey && c.experience?.length > 0){
    notify("Rewriting experience with AI…");
    try{
      const rewritten = await rewriteExperience(c.experience, apiKey);
      setSelected({...c, experience: rewritten});
    }catch(e){ setSelected(c); }
  } else { setSelected(c); }
  setTimeout(()=>setView("cv"),400);
}} disabled={saving}>Save & Generate CV</Btn>}
          </div>
        </div>
      )}
    </>
  );
}
