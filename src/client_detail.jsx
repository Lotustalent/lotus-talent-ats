import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function ClientDetail(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="clientDetail"&&selectedClient&&(()=>{
        const cl=clients.find(c=>c.id===selectedClient.id)||selectedClient;
        return(
          <div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <Btn variant="ghost" small onClick={()=>setView("clients")}>← Back</Btn>
              <h2 style={{margin:0,fontSize:17,fontWeight:800,color:T.navy}}>{cl.company}</h2>
              <Badge status={cl.status} colors={CLIENT_STATUS_COLORS}/>
              <div style={{marginLeft:"auto"}}><Btn small onClick={()=>{setClientForm({...cl});setView("editClient");}}>Edit</Btn></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              <div style={{background:T.white,borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
                <SH title="Company"/>
                {[["Industry",cl.industry],["Origin",cl.origin],["HQ Country",cl.hqCountry],["Local Office",cl.localOffice],["Agreed Fee",cl.feeAgreed],["Fee Signed",cl.feeSignedDate]].filter(([,v])=>v).map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.sand}`,fontSize:13}}>
                    <span style={{color:T.slate,fontSize:12}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:T.white,borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
                <SH title="Main Contact"/>
                {[["Name",cl.contactName],["Title",cl.contactTitle],["Email",cl.contactEmail],["Phone",cl.contactPhone]].filter(([,v])=>v).map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.sand}`,fontSize:13}}>
                    <span style={{color:T.slate,fontSize:12}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {cl.openRoles&&<div style={{background:T.white,borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:20}}><SH title="Open Roles / Active Mandates"/><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{cl.openRoles.split("\n").filter(Boolean).map((r,i)=><span key={i} style={{background:T.mist,color:T.indigo,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:600}}>{r}</span>)}</div></div>}
            {cl.notes&&<div style={{background:T.white,borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:20}}><SH title="Notes & Relationship"/><div style={{fontSize:13,color:T.slate,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{cl.notes}</div></div>}
            <div style={{background:T.white,borderRadius:10,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",letterSpacing:"0.1em"}}>📎 Documents & Email Log</div>
                <div><input ref={docRef} type="file" style={{display:"none"}} onChange={e=>handleClientDoc(e.target.files[0],cl.id)}/><Btn small onClick={()=>docRef.current.click()}>+ Upload</Btn></div>
              </div>
              <div style={{fontSize:12,color:T.slate,marginBottom:12,background:T.mist,borderRadius:6,padding:"8px 12px"}}>Upload emails (as PDF), contracts, proposals, or any correspondence. Stored as backup log.</div>
              {(!cl.documents||cl.documents.length===0)&&<div style={{textAlign:"center",padding:"24px 0",color:T.silver,fontSize:13}}>No documents yet</div>}
              {(cl.documents||[]).map(doc=>(
                <div key={doc.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,border:`1px solid ${T.sand}`,marginBottom:8,background:T.ivory}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:20}}>{doc.type?.includes("pdf")?"📄":doc.type?.includes("image")?"🖼️":"📎"}</div>
                    <div><div style={{fontSize:13,fontWeight:600,color:T.navy}}>{doc.name}</div><div style={{fontSize:11,color:T.slate}}>{doc.date} · {doc.size}</div></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <a href={doc.data} download={doc.name} style={{textDecoration:"none"}}><Btn small variant="ghost">⬇</Btn></a>
                    <Btn small variant="ghost" onClick={()=>deleteDoc(cl.id,doc.id)}>🗑</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </>
  );
}
