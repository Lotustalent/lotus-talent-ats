import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function CandidatesList(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{!loading&&view==="candidates"&&(
        <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
          <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}} onClick={()=>fileRef.current.click()}
            style={{border:`2px dashed ${T.sky}`,borderRadius:10,padding:"22px 20px",textAlign:"center",marginBottom:20,cursor:"pointer",background:uploading?T.mist:T.white}}>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            {uploading?<div><div style={{fontSize:24}}>⏳</div><div style={{color:T.indigo,fontWeight:700,marginTop:6}}>Extracting CV with AI…</div></div>
            :apiKey?<div><div style={{fontSize:24}}>📄</div><div style={{color:T.navy,fontWeight:700,marginTop:6}}>Drop CV here or click to upload</div><div style={{color:T.slate,fontSize:12,marginTop:3}}>PDF or Word — AI extracts all fields automatically</div></div>
            :<div><div style={{fontSize:24}}>⚙️</div><div style={{color:T.vermil,fontWeight:700,marginTop:6}}>API key needed</div><div style={{color:T.slate,fontSize:12,marginTop:3}}>Go to Settings → add your Anthropic API key</div></div>}
          </div>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search candidates…" style={{flex:1,minWidth:180,padding:"7px 12px",borderRadius:6,border:`1px solid ${T.sand}`,fontSize:13,outline:"none"}}/>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"7px 12px",borderRadius:6,border:`1px solid ${T.sand}`,fontSize:13,background:T.white}}>
              <option>All</option>{Object.keys(STATUS_COLORS).map(s=><option key={s}>{s}</option>)}
            </select>
            <Btn onClick={()=>{setForm({id:uid(),status:"New",source:"Manual",addedDate:today(),education:[],experience:[],languages:[],skills:[]});setView("editCandidate");}}>+ Add Manually</Btn>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(STATUS_COLORS).map(([s,c])=>{const n=candidates.filter(x=>x.status===s).length;return n>0?<span key={s} style={{background:c.bg,color:c.text,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s}: {n}</span>:null;})}
          </div>
          <div style={{background:T.white,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:T.navy,color:T.white}}>
                {["Candidate","Current Role","Nationality / Visa","Desired Salary","Available","Status","Actions"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredCandidates.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:T.slate}}>No candidates yet — upload a CV or add manually</td></tr>}
                {filteredCandidates.map((c,i)=>(
                  <tr key={c.id} style={{background:i%2===0?T.white:T.ivory,borderBottom:`1px solid ${T.sand}`}}>
                    <td style={{padding:"10px 14px"}}><div style={{fontWeight:700,color:T.navy}}>{c.name}</div><div style={{fontSize:11,color:T.slate}}>{c.source} · {c.addedDate}</div></td>
                    <td style={{padding:"10px 14px"}}><div>{c.currentRole}</div><div style={{fontSize:11,color:T.slate}}>{c.currentCompany}</div></td>
                    <td style={{padding:"10px 14px"}}><div>{c.nationality}</div><div style={{fontSize:11,color:T.slate}}>{c.visaStatus}</div></td>
                    <td style={{padding:"10px 14px",fontWeight:600}}>{c.desiredSalary||"—"}</td>
                    <td style={{padding:"10px 14px"}}>{c.availability||"—"}</td>
                    <td style={{padding:"10px 14px"}}><Badge status={c.status}/></td>
                    <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:6}}>
                      <Btn small variant="ghost" onClick={()=>{setForm({...c});setView("editCandidate");}}>Edit</Btn>
                      <Btn small onClick={()=>{setSelected(c);setView("cv");}}>CV</Btn>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{color:T.silver,fontSize:11,marginTop:8,textAlign:"right"}}>{filteredCandidates.length} candidate{filteredCandidates.length!==1?"s":""}</div>
        </div>
      )}
    </>
  );
}
