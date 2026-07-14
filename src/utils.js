const T = {
  navy:"#1a2744",indigo:"#2d4a8a",sky:"#4a7fc1",vermil:"#b5446e",
  ivory:"#f8f6f1",sand:"#ede9e0",mist:"#e8edf5",ink:"#1a1a2e",
  slate:"#5a6480",silver:"#9aa3b8",white:"#ffffff",green:"#2a7d4f",amber:"#c47d0a"
};

const STATUS_COLORS = {
  "New":{bg:"#e8edf5",text:"#2d4a8a"},
  "Screening":{bg:"#fef3e2",text:"#8a5a00"},
  "Shortlisted":{bg:"#e8f5ee",text:"#2a7d4f"},
  "Sent to Client":{bg:"#f0ebff",text:"#5a2d9a"},
  "Placed":{bg:"#d4edda",text:"#155724"},
  "On Hold":{bg:"#f5f5f5",text:"#5a6480"},
  "Not Suitable":{bg:"#fde8e8",text:"#7a1f1f"}
};

const CLIENT_STATUS_COLORS = {
  "Active":{bg:"#e8f5ee",text:"#2a7d4f"},
  "Prospect":{bg:"#e8edf5",text:"#2d4a8a"},
  "On Hold":{bg:"#fef3e2",text:"#8a5a00"},
  "Inactive":{bg:"#f5f5f5",text:"#5a6480"}
};

function uid(){return "x"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function today(){return new Date().toISOString().slice(0,10);}

export { T, uid, today };