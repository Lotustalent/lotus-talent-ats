import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function EditJob(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="editJob"&&jobForm&&(
        <div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <Btn variant="ghost" small onClick={()=>{setView("jobs");setJobForm(null);}}>← Back</Btn>
            <h2 style={{margin:0,fontSize:17,fontWeight:800,color:"#1a2744"}}>{jobForm.title?`Edit: ${jobForm.title}`:"New Job Vacancy"}</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#2d4a8a",textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"2px solid #e8edf5",paddingBottom:6,marginBottom:14,marginTop:20}}>Job Information</div>
              <Field label="Job Title *" value={jobForm.title} onChange={v=>setJF("title",v)} placeholder="e.g. Marketing Manager"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Job ID" value={jobForm.jobId} onChange={v=>setJF("jobId",v)} placeholder="LTC-2026-001"/>
                <Field label="Status" as="select" value={jobForm.status} onChange={v=>setJF("status",v)} options={JOB_STATUSES}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:700,color:"#5a6480",textTransform:"uppercase",letterSpacing:"0.06em"}}>LINK TO CLIENT *</label>
                <select value={jobForm.clientId||""} onChange={e=>{
                  const v=e.target.value;
                  const cl=clients.find(c=>c.id===v);
                  setJobForm(f=>({...f,clientId:v,clientName:cl?cl.company:""}));
                }} style={{width:"100%",padding:"8px 12px",borderRadius:6,fontSize:13,color:"#1a1a2e",border:"1px solid #ede9e0",background:"#ffffff",boxSizing:"border-box",fontFamily:"Inter,sans-serif",outline:"none",marginTop:4}}>
                  <option value="">-- Select Client --</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <Field label="Location" value={jobForm.location} onChange={v=>setJF("location",v)} placeholder="Amsterdam"/>
              <Field label="Contract Type" as="select" value={jobForm.contractType} onChange={v=>setJF("contractType",v)} options={["Permanent","Fixed Term","Freelance/ZZP","Internship"]}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Salary Min (€)" value={jobForm.salaryMin} onChange={v=>setJF("salaryMin",v)} placeholder="50000"/>
                <Field label="Salary Max (€)" value={jobForm.salaryMax} onChange={v=>setJF("salaryMax",v)} placeholder="70000"/>
              </div>
              <Field label="Benefits" as="textarea" value={jobForm.benefits} onChange={v=>setJF("benefits",v)} placeholder="Bonus scheme, 25 vacation days, Pension, Hybrid working" rows={3}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Target Start Date" value={jobForm.targetStart} onChange={v=>setJF("targetStart",v)} placeholder="e.g. ASAP / 2026-10-01"/>
                <Field label="Date Opened" type="date" value={jobForm.dateOpened} onChange={v=>setJF("dateOpened",v)}/>
              </div>
              {(jobForm.status==="Filled"||jobForm.status==="Cancelled")&&(
                <Field label="Date Closed" type="date" value={jobForm.dateClosed} onChange={v=>setJF("dateClosed",v)}/>
              )}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#2d4a8a",textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"2px solid #e8edf5",paddingBottom:6,marginBottom:14,marginTop:20}}>Role Details</div>
              <Field label="Language Requirements" as="textarea" value={jobForm.languages||""} onChange={v=>setJF("languages",v)} placeholder="Japanese (Business Level), English (Fluent)" rows={2}/>
              <Field label="Job Description / Role Summary" as="textarea" value={jobForm.description} onChange={v=>setJF("description",v)} rows={4} placeholder="Overview of the role and responsibilities…"/>
              <Field label="Requirements / Must-Haves" as="textarea" value={jobForm.requirements} onChange={v=>setJF("requirements",v)} rows={4} placeholder="5+ years experience in…, Fluent in Japanese, Experience with…"/>
              <Field label="Nice to Have" as="textarea" value={jobForm.niceToHave} onChange={v=>setJF("niceToHave",v)} rows={3} placeholder="Additional desirable skills…"/>
              <Field label="Internal Notes" as="textarea" value={jobForm.notes} onChange={v=>setJF("notes",v)} rows={3} placeholder="Client preferences, cultural notes, urgent timeline…"/>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid #ede9e0"}}>
            <Btn variant="ghost" onClick={()=>{setView("jobs");setJobForm(null);}}>Cancel</Btn>
            <Btn variant="success" onClick={handleSaveJob} disabled={saving}>{saving?"Saving…":"Save Job"}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
