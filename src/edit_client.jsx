import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import { saveJob, saveClient, loadJobs } from "./api.js";
import { rewriteExperience } from "./ai.js";

export default function EditClient(props) {
  const { view, setView, candidates, clients, jobs, setJobs, form, setForm, clientForm, setClientForm, jobForm, setJobForm, selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob, search, setSearch, filterStatus, setFilterStatus, clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter, uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob, saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey, notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF } = props;
  return (
    <>
{view==="editClient"&&clientForm&&(
        <div style={{padding:24,maxWidth:860,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <Btn variant="ghost" small onClick={()=>{setView("clients");setClientForm(null);}}>← Back</Btn>
            <h2 style={{margin:0,fontSize:17,fontWeight:800,color:T.navy}}>{clientForm.company?`Edit: ${clientForm.company}`:"New Client"}</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <SH title="Company Information"/>
              <Field label="Company Name *" value={clientForm.company} onChange={v=>setCF("company",v)}/>
              <Field label="Industry" value={clientForm.industry} onChange={v=>setCF("industry",v)} placeholder="Consumer Electronics, Trading…"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Origin / Country" as="select" value={clientForm.origin} onChange={v=>setCF("origin",v)} options={["Japanese","Korean","Chinese","Taiwanese","Singaporean","Indian","Vietnamese","Thai","Indonesian","Malaysian","Other Asian","Dutch","German","French","British","American","Belgian","Swedish","Swiss","Spanish","Italian","Polish","Other European","Other"]}/>
                <Field label="HQ Country" value={clientForm.hqCountry} onChange={v=>setCF("hqCountry",v)} placeholder="Japan"/>
              </div>
              <Field label="Local Office (City)" value={clientForm.localOffice} onChange={v=>setCF("localOffice",v)} placeholder="Amsterdam"/>
              <Field label="Status" as="select" value={clientForm.status} onChange={v=>setCF("status",v)} options={Object.keys(CLIENT_STATUS_COLORS)}/>
              <SH title="Fee Agreement"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Agreed Fee %" value={clientForm.feeAgreed} onChange={v=>setCF("feeAgreed",v)} placeholder="20%"/>
                <Field label="Agreement Signed Date" type="date" value={clientForm.feeSignedDate} onChange={v=>setCF("feeSignedDate",v)}/>
              </div>
              <SH title="Notes & Relationship"/>
              <Field label="Notes" as="textarea" value={clientForm.notes} onChange={v=>setCF("notes",v)} placeholder="Culture notes, decision process, preferences…" rows={4}/>
            </div>
            <div>
              <SH title="Main Contact Person"/>
              <Field label="Contact Name" value={clientForm.contactName} onChange={v=>setCF("contactName",v)}/>
              <Field label="Job Title" value={clientForm.contactTitle} onChange={v=>setCF("contactTitle",v)} placeholder="HR Manager…"/>
              <Field label="Email" type="email" value={clientForm.contactEmail} onChange={v=>setCF("contactEmail",v)}/>
              <Field label="Phone" value={clientForm.contactPhone} onChange={v=>setCF("contactPhone",v)}/>
              <SH title="Open Roles / Mandates"/>
              <Field label="Active Job Openings" as="textarea" value={clientForm.openRoles} onChange={v=>setCF("openRoles",v)} placeholder={"Marketing Manager\nSales Director"} rows={4}/>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:`1px solid ${T.sand}`}}>
            <Btn variant="ghost" onClick={()=>{setView("clients");setClientForm(null);}}>Cancel</Btn>
            <Btn variant="success" onClick={handleSaveClient} disabled={saving}>{saving?"Saving…":"Save Client"}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
