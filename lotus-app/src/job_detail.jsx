import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function JobDetail(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="jobDetail"&&selectedJob&&(()=>{
        const job=jobs.find(j=>j.id===selectedJob.id)||selectedJob;
        const pipeline=job.pipeline||[];
        return(
          <div style={{padding:24,maxWidth:960,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              <Btn variant="ghost" small onClick={()=>setView("jobs")}>← Back</Btn>
              <h2 style={{margin:0,fontSize:17,fontWeight:800,color:"#1a2744"}}>{job.title}</h2>
              <span style={{background:job.status==="Open"?"#e8f5ee":job.status==="Filled"?"#d4edda":job.status==="On Hold"?"#fef3e2":"#fde8e8",
                color:job.status==="Open"?"#2a7d4f":job.status==="Filled"?"#155724":job.status==="On Hold"?"#8a5a00":"#7a1f1f",
                padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{job.status}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <Btn small onClick={()=>{setJobForm({...job});setView("editJob");}}>Edit</Btn>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              {/* Job Info */}
              <div style={{background:"#ffffff",borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#2d4a8a",textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"2px solid #e8edf5",paddingBottom:6,marginBottom:14}}>Job Details</div>
                {[["Job ID",job.jobId],["Client",job.clientName],["Location",job.location],["Contract",job.contractType],
                  ["Salary Range",job.salaryMin||job.salaryMax?`€${job.salaryMin||"?"} – €${job.salaryMax||"?"} gross`:"—"],
                  ["Target Start",job.targetStart],["Date Opened",job.dateOpened],["Date Closed",job.dateClosed||"—"]
                ].filter(([,v])=>v).map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #ede9e0",fontSize:13}}>
                    <span style={{color:"#5a6480",fontSize:12}}>{l}</span>
                    <span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Role Details */}
              <div style={{background:"#ffffff",borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#2d4a8a",textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"2px solid #e8edf5",paddingBottom:6,marginBottom:14}}>Role Details</div>
                {job.benefits&&<div style={{marginBottom:10}}><div style={{fontSize:11,color:"#5a6480",fontWeight:700,marginBottom:4}}>BENEFITS</div><div style={{fontSize:12,color:"#1a1a2e",whiteSpace:"pre-wrap"}}>{job.benefits}</div></div>}
                {job.languages&&<div style={{marginBottom:10}}><div style={{fontSize:11,color:"#5a6480",fontWeight:700,marginBottom:4}}>LANGUAGES</div><div style={{fontSize:12,color:"#1a1a2e",whiteSpace:"pre-wrap"}}>{job.languages}</div></div>}
                {job.requirements&&<div style={{marginBottom:10}}><div style={{fontSize:11,color:"#5a6480",fontWeight:700,marginBottom:4}}>REQUIREMENTS</div><div style={{fontSize:12,color:"#1a1a2e",whiteSpace:"pre-wrap"}}>{job.requirements}</div></div>}
                {job.niceToHave&&<div style={{marginBottom:10}}><div style={{fontSize:11,color:"#5a6480",fontWeight:700,marginBottom:4}}>NICE TO HAVE</div><div style={{fontSize:12,color:"#1a1a2e",whiteSpace:"pre-wrap"}}>{job.niceToHave}</div></div>}
                {job.notes&&<div><div style={{fontSize:11,color:"#5a6480",fontWeight:700,marginBottom:4}}>INTERNAL NOTES</div><div style={{fontSize:12,color:"#1a1a2e",whiteSpace:"pre-wrap"}}>{job.notes}</div></div>}
              </div>
            </div>

            {/* Description */}
            {job.description&&(
              <div style={{background:"#ffffff",borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#2d4a8a",textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"2px solid #e8edf5",paddingBottom:6,marginBottom:12}}>Job Description</div>
                <div style={{fontSize:13,color:"#1a1a2e",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{job.description}</div>
              </div>
            )}

            {/* Candidate Pipeline */}
            <div style={{background:"#ffffff",borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#2d4a8a",textTransform:"uppercase",letterSpacing:"0.1em"}}>👥 Candidate Pipeline</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <select id="add-candidate-select" style={{padding:"6px 10px",borderRadius:6,border:"1px solid #ede9e0",fontSize:12,maxWidth:200}}>
                    <option value="">— Add candidate —</option>
                    {candidates.filter(c=>!pipeline.find(p=>p.candidateId===c.id)).map(c=>(
                      <option key={c.id} value={c.id}>{c.name} ({c.currentRole||"No role"})</option>
                    ))}
                  </select>
                  <Btn small onClick={async()=>{
                    const sel=document.getElementById("add-candidate-select");
                    const cid=sel?.value;
                    if(!cid){notify("Select a candidate first","err");return;}
                    const cand=candidates.find(c=>c.id===cid);
                    if(!cand)return;
                    const newEntry={candidateId:cid,candidateName:cand.name,status:"Considering",addedDate:today(),notes:""};
                    const updatedJob={...job,pipeline:[...pipeline,newEntry]};
                    setJobs(prev=>prev.map(j=>j.id===job.id?updatedJob:j));
                    setSelectedJob(updatedJob);
                    try{await saveJob(updatedJob);notify(cand.name+" added to pipeline");}
                    catch(e){notify("Failed to save","err");}
                    sel.value="";
                  }}>+ Add</Btn>
                </div>
              </div>

              {/* Pipeline status summary */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                {JOB_CANDIDATE_STATUSES.map(s=>{
                  const n=pipeline.filter(p=>p.status===s).length;
                  return n>0?<span key={s} style={{background:"#e8edf5",color:"#2d4a8a",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{s}: {n}</span>:null;
                })}
              </div>

              {pipeline.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"#9aa3b8",fontSize:13}}>No candidates in pipeline yet — add candidates above</div>}

              {pipeline.map((p,pi)=>(
                <div key={p.candidateId} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,border:"1px solid #ede9e0",marginBottom:8,background:"#f8f6f1",flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#1a2744"}}>{p.candidateName}</div>
                    <div style={{fontSize:11,color:"#5a6480"}}>{p.addedDate}</div>
                  </div>
                  <select value={p.status} onChange={async e=>{
                    const newStatus=e.target.value;
                    const updatedPipeline=pipeline.map((pp,i)=>i===pi?{...pp,status:newStatus}:pp);
                    const updatedJob={...job,pipeline:updatedPipeline};
                    setJobs(prev=>prev.map(j=>j.id===job.id?updatedJob:j));
                    setSelectedJob(updatedJob);
                    try{await saveJob(updatedJob);}catch(e){}
                  }} style={{padding:"4px 8px",borderRadius:6,border:"1px solid #ede9e0",fontSize:12,background:"#ffffff"}}>
                    {JOB_CANDIDATE_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <input placeholder="Notes…" value={p.notes||""} onChange={e=>{
                    const updatedPipeline=pipeline.map((pp,i)=>i===pi?{...pp,notes:e.target.value}:pp);
                    const updatedJob={...job,pipeline:updatedPipeline};
                    setJobs(prev=>prev.map(j=>j.id===job.id?updatedJob:j));
                    setSelectedJob(updatedJob);
                  }} onBlur={async()=>{try{await saveJob({...job,pipeline});}catch(e){}}}
                  style={{flex:2,minWidth:120,padding:"4px 8px",borderRadius:6,border:"1px solid #ede9e0",fontSize:12}}/>
                  <button onClick={async()=>{
                    const updatedPipeline=pipeline.filter((_,i)=>i!==pi);
                    const updatedJob={...job,pipeline:updatedPipeline};
                    setJobs(prev=>prev.map(j=>j.id===job.id?updatedJob:j));
                    setSelectedJob(updatedJob);
                    try{await saveJob(updatedJob);notify("Candidate removed");}catch(e){}
                  }} style={{background:"none",border:"none",cursor:"pointer",color:"#b5446e",fontSize:12}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

            {/* ── CLIENTS LIST ── */}
      {!loading&&view==="clients"&&(
        <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center"}}>
            <input value={clientSearch} onChange={e=>setClientSearch(e.target.value)} placeholder="Search clients…" style={{flex:1,minWidth:180,padding:"7px 12px",borderRadius:6,border:`1px solid ${T.sand}`,fontSize:13,outline:"none"}}/>
            <Btn onClick={()=>{setClientForm({id:uid(),status:"Prospect",origin:"Japanese",addedDate:today(),documents:[],openRoles:""});setView("editClient");}}>+ Add Client</Btn>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(CLIENT_STATUS_COLORS).map(([s,c])=>{const n=clients.filter(x=>x.status===s).length;return n>0?<span key={s} style={{background:c.bg,color:c.text,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s}: {n}</span>:null;})}
          </div>
          <div style={{background:T.white,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:T.navy,color:T.white}}>
                {["Company","Origin","Contact","Open Roles","Fee","Status","Actions"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredClients.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:T.slate}}>No clients yet — add your first client</td></tr>}
                {filteredClients.map((c,i)=>(
                  <tr key={c.id} style={{background:i%2===0?T.white:T.ivory,borderBottom:`1px solid ${T.sand}`}}>
                    <td style={{padding:"10px 14px"}}><div style={{fontWeight:700,color:T.navy}}>{c.company}</div><div style={{fontSize:11,color:T.slate}}>{c.industry} · {c.localOffice}</div></td>
                    <td style={{padding:"10px 14px"}}><div>{c.origin}</div><div style={{fontSize:11,color:T.slate}}>HQ: {c.hqCountry}</div></td>
                    <td style={{padding:"10px 14px"}}><div>{c.contactName}</div><div style={{fontSize:11,color:T.slate}}>{c.contactTitle}</div></td>
                    <td style={{padding:"10px 14px",fontSize:12,color:T.slate,maxWidth:180}}>{c.openRoles||"—"}</td>
                    <td style={{padding:"10px 14px",fontWeight:600}}>{c.feeAgreed||"—"}</td>
                    <td style={{padding:"10px 14px"}}><Badge status={c.status} colors={CLIENT_STATUS_COLORS}/></td>
                    <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:6}}>
                      <Btn small variant="ghost" onClick={()=>{setClientForm({...c});setView("editClient");}}>Edit</Btn>
                      <Btn small onClick={()=>{setSelectedClient(clients.find(x=>x.id===c.id));setView("clientDetail");}}>View</Btn>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{color:T.silver,fontSize:11,marginTop:8,textAlign:"right"}}>{filteredClients.length} client{filteredClients.length!==1?"s":""}</div>
        </div>
      )}
    </>
  );
}
