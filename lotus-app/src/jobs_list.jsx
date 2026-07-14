import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";

export default function JobsList(props) {
  const { view, setView, jobs, setJobs, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, setJobForm, setSelectedJob, clients, candidates, notify } = props;
  return (
    <>
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
