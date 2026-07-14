import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function ClientCv(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="cv"&&selected&&(
        <div style={{padding:24,maxWidth:860,margin:"0 auto"}}>
          <div className="no-print" style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
            <Btn variant="ghost" small onClick={()=>setView("candidates")}>← Back</Btn>
            <span style={{fontWeight:700,color:T.navy}}>Client CV — {selected.name}</span>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
              {apiKey&&<Btn variant="ghost" small onClick={async()=>{
                notify("Rewriting experience with AI…");
                try{
                  const rewritten=await rewriteExperience(selected.experience||[],apiKey);
                  setSelected(s=>({...s,experience:rewritten}));
                  notify("Experience rewritten!");
                }catch(e){notify("Rewrite failed","err");}
              }}>✨ Rewrite Experience</Btn>}
              <Btn onClick={()=>window.print()}>🖨 Print / Save PDF</Btn>
            </div>
          </div>
          <div className="no-print" style={{background:T.mist,borderRadius:8,padding:"9px 14px",marginBottom:14,fontSize:12,color:T.slate}}>Print → "Save as PDF" to export.</div>
          <div id="client-cv" style={{background:T.white,borderRadius:10,boxShadow:"0 2px 20px rgba(0,0,0,0.1)",overflow:"hidden"}}>
            <div style={{background:T.navy,color:T.white,padding:"20px 30px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,background:T.vermil,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🪷</div>
                <div><div style={{fontSize:16,fontWeight:800}}>Lotus Talent Consultancy</div><div style={{fontSize:10,color:T.silver,letterSpacing:"0.08em"}}>ASIAN SPECIALIST · NETHERLANDS</div></div>
              </div>
              <div style={{textAlign:"right",fontSize:11,color:T.silver}}><div>Candidate Profile · Confidential</div><div>{today()}</div></div>
            </div>
            <div style={{background:T.indigo,color:T.white,padding:"16px 30px"}}>
              <div style={{fontSize:22,fontWeight:800}}>{selected.name||""}</div>
              <div style={{fontSize:13,color:"#a8bfdf",marginTop:2}}>{selected.currentRole||""}{(selected.currentCompany||"")?(` · ${selected.currentCompany||""}`):"" }</div>
            </div>
            <div style={{padding:"22px 30px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22}}>
                {[["Nationality",selected.nationality],["Gender",selected.gender],["Visa Status",selected.visaStatus],["Visa Expiry",selected.visaExpiry],["Available From",selected.availability],["Notice Period",selected.noticePeriod]].filter(([,v])=>v).map(([l,v])=>(
                  <div key={l} style={{background:T.mist,borderRadius:7,padding:"9px 12px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.slate,textTransform:"uppercase",letterSpacing:"0.07em"}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              {(selected.desiredSalary)&&(
                <div style={{background:"#fff8e8",border:"1px solid #e8c97a",borderRadius:8,padding:"10px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:18}}>💰</div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:"#8a6000",textTransform:"uppercase",letterSpacing:"0.07em"}}>Desired Annual Salary</div>
                    <div style={{fontSize:15,fontWeight:800,color:"#5a3e00",marginTop:2}}>{selected.desiredSalary} <span style={{fontSize:11,fontWeight:500,color:"#8a6000"}}>gross per year + 8% holiday allowance</span></div>
                  </div>
                </div>
              )}
              {(selected.languages||[]).length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",borderBottom:`2px solid ${T.mist}`,paddingBottom:5,marginBottom:9}}>Languages</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {(selected.languages||[]).map(l=><span key={l} style={{background:T.navy,color:T.white,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>{l}</span>)}
                  </div>
                </div>
              )}
              {((selected.softwareSkills||[]).length>0||(selected.skills||[]).length>0)&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",borderBottom:`2px solid ${T.mist}`,paddingBottom:5,marginBottom:9}}>Software & Tools</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {[...(selected.softwareSkills||[]),...(selected.skills||[])].map(s=><span key={s} style={{background:"#eef2ff",color:"#2d4a8a",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600,border:"1px solid #c7d2f5"}}>{s}</span>)}
                  </div>
                </div>
              )}
              {(selected.softSkills||[]).length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",borderBottom:`2px solid ${T.mist}`,paddingBottom:5,marginBottom:9}}>Key Strengths</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {(selected.softSkills||[]).map(s=><span key={s} style={{background:T.sand,color:T.navy,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>{s}</span>)}
                  </div>
                </div>
              )}
              {(selected.education||[]).length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",borderBottom:`2px solid ${T.mist}`,paddingBottom:5,marginBottom:10}}>Education</div>
                  {(selected.education||[]).map((e,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<(selected.education||[]).length-1?`1px solid ${T.sand}`:"none"}}>
                      <div><div style={{fontWeight:700,fontSize:13}}>{e.degree||""}</div><div style={{fontSize:12,color:T.slate}}>{e.school||""}</div></div>
                      <div style={{fontSize:12,color:T.slate}}>{e.year||""}</div>
                    </div>
                  ))}
                </div>
              )}
              {(selected.experience||[]).length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",borderBottom:`2px solid ${T.mist}`,paddingBottom:5,marginBottom:12}}>Work Experience</div>
                  {(selected.experience||[]).map((exp,i)=>(
                    <div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<(selected.experience||[]).length-1?`1px solid ${T.sand}`:"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontWeight:700,fontSize:14,color:T.navy}}>{exp.role||""}</div><div style={{fontSize:13,color:T.indigo,fontWeight:600}}>{exp.company||""}</div></div>
                        <div style={{fontSize:11,color:T.slate,background:T.mist,borderRadius:4,padding:"2px 8px",whiteSpace:"nowrap"}}>{exp.start||""} – {exp.end||"Present"}</div>
                      </div>
                      {(exp.bullets||[]).length>0
                        ? <ul style={{marginTop:6,paddingLeft:18}}>{(exp.bullets||[]).map((b,bi)=><li key={bi} style={{fontSize:12,color:T.slate,lineHeight:1.7,marginBottom:3}}>{b}</li>)}</ul>
                        : exp.description&&<div style={{fontSize:12,color:T.slate,marginTop:5,lineHeight:1.6}}>{exp.description}</div>
                      }
                      {exp.reasonLeaving&&<div style={{marginTop:7,fontSize:11,background:"#fff8e8",borderLeft:`3px solid ${T.amber}`,padding:"4px 9px",borderRadius:"0 4px 4px 0",color:"#7a5000"}}><strong>Reason for leaving: </strong>{exp.reasonLeaving}</div>}
                    </div>
                  ))}
                </div>
              )}
              {selected.notes&&<div style={{background:T.mist,borderRadius:7,padding:"11px 14px"}}><div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",marginBottom:5}}>Additional Notes</div><div style={{fontSize:12,color:T.slate,lineHeight:1.6}}>{selected.notes}</div></div>}
            </div>
            <div style={{background:T.sand,padding:"10px 30px",display:"flex",justifyContent:"space-between",fontSize:10,color:T.silver}}><span>Presented by Lotus Talent Consultancy · Confidential</span><span>Prepared exclusively for client review</span></div>
          </div>
        </div>
      )}

            {/* ── JOBS LIST ── */}
      {!loading&&view==="jobs"&&(
        <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
            <input value={jobSearch} onChange={e=>setJobSearch(e.target.value)} placeholder="Search jobs…"
              style={{flex:1,minWidth:180,padding:"7px 12px",borderRadius:6,border:"1px solid #ede9e0",fontSize:13,outline:"none"}}/>
            <select value={jobStatusFilter} onChange={e=>setJobStatusFilter(e.target.value)}
              style={{padding:"7px 12px",borderRadius:6,border:"1px solid #ede9e0",fontSize:13,background:"#ffffff"}}>
              <option>All</option>{JOB_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <Btn onClick={()=>{
              const id = "j"+Date.now().toString(36);
              setJobForm({id,jobId:"LTC-"+new Date().getFullYear()+"-"+String(jobs.length+1).padStart(3,"0"),
                status:"Open",dateOpened:today(),pipeline:[],languages:[],contractType:"Permanent"});
              setView("editJob");
            }}>+ Add Job</Btn>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {JOB_STATUSES.map(s=>{const n=jobs.filter(j=>j.status===s).length;return n>0?
              <span key={s} style={{background:s==="Open"?"#e8f5ee":s==="Filled"?"#d4edda":s==="On Hold"?"#fef3e2":"#fde8e8",
                color:s==="Open"?"#2a7d4f":s==="Filled"?"#155724":s==="On Hold"?"#8a5a00":"#7a1f1f",
                borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s}: {n}</span>:null;})}
          </div>

          <div style={{background:"#ffffff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#1a2744",color:"#ffffff"}}>
                {["Job","Client","Location","Salary Range","Start Date","Pipeline","Status","Actions"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {jobs.filter(j=>{
                  const q=jobSearch.toLowerCase();
                  return(!q||[j.title,j.clientName,j.location].some(v=>v?.toLowerCase().includes(q)))&&(jobStatusFilter==="All"||j.status===jobStatusFilter);
                }).length===0&&<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#5a6480"}}>No jobs yet — add your first vacancy</td></tr>}
                {jobs.filter(j=>{
                  const q=jobSearch.toLowerCase();
                  return(!q||[j.title,j.clientName,j.location].some(v=>v?.toLowerCase().includes(q)))&&(jobStatusFilter==="All"||j.status===jobStatusFilter);
                }).map((j,i)=>{
                  const placed=( j.pipeline||[]).filter(p=>p.status==="Placed").length;
                  const total=(j.pipeline||[]).length;
                  return(
                  <tr key={j.id} style={{background:i%2===0?"#ffffff":"#f8f6f1",borderBottom:"1px solid #ede9e0"}}>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{fontWeight:700,color:"#1a2744"}}>{j.title}</div>
                      <div style={{fontSize:11,color:"#5a6480"}}>{j.jobId}</div>
                    </td>
                    <td style={{padding:"10px 14px"}}>{j.clientName||"—"}</td>
                    <td style={{padding:"10px 14px"}}>{j.location||"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:12}}>
                      {j.salaryMin||j.salaryMax?`€${j.salaryMin||"?"} – €${j.salaryMax||"?"}`:"—"}
                    </td>
                    <td style={{padding:"10px 14px",fontSize:12}}>{j.targetStart||"—"}</td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{fontSize:12,color:"#5a6480"}}>{total} candidate{total!==1?"s":""}</div>
                      {placed>0&&<div style={{fontSize:11,color:"#2a7d4f",fontWeight:700}}>✓ {placed} placed</div>}
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      <span style={{background:j.status==="Open"?"#e8f5ee":j.status==="Filled"?"#d4edda":j.status==="On Hold"?"#fef3e2":"#fde8e8",
                        color:j.status==="Open"?"#2a7d4f":j.status==="Filled"?"#155724":j.status==="On Hold"?"#8a5a00":"#7a1f1f",
                        padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{j.status}</span>
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <Btn small variant="ghost" onClick={()=>{setJobForm({...j});setView("editJob");}}>Edit</Btn>
                        <Btn small onClick={()=>{setSelectedJob(j);setView("jobDetail");}}>View</Btn>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
