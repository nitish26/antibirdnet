/* app.js - client-side behavior for the Anti Bird Net site
   Configuration & usage:
   - By default this script will POST form submissions to a Formspree endpoint.
     Replace `FORMSPREE_ENDPOINT` below with your Formspree endpoint (e.g. https://formspree.io/f/yourid).
   - Alternative endpoints:
     * Google Apps Script Web App: deploy an Apps Script that accepts POST and returns JSON. Set `ENDPOINT_TYPE='GAS'` and provide the URL.
     * Firebase: set ENDPOINT_TYPE='FIREBASE' and use Firebase REST API or client SDK (requires additional setup).
   - IMPORTANT: GitHub Pages is a static host and cannot accept form submissions by itself. To store data on GitHub you must use a server (e.g., GitHub Actions that accept requests, or third-party services). See README section at the bottom for options.
*/

const CONFIG = {
  ENDPOINT_TYPE: 'GAS', // 'FORMSPREE' | 'GAS' | 'FIREBASE' | 'NONE'
//   FORMSPREE_ENDPOINT: 'https://formspree.io/f/your-form-id', // replace with your id
  GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwuoAiDi9qAUgyW0GssbxsgvVGocpFRuM1toQrphE79QRN3VV2vrhdsp1uJwaVOt4i98A/exec',
//   FIREBASE_REST_ENDPOINT: 'https://your-project.firebaseio.com/leads.json',
};

const form = document.getElementById('leadForm');
const statusEl = document.getElementById('formStatus');
const saveLocalBtn = document.getElementById('saveLocal');

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   statusEl.textContent = 'Sending...';

//   const payload = {
//     fname: form.fname.value.trim(),
//     lname: form.lname.value.trim(),
//     phone: form.phone.value.trim(),
//     email: form.email.value.trim(),
//     service: form.service.value,
//     message: form.message.value.trim(),
//     createdAt: new Date().toISOString()
//   };

//   try {
//     if (CONFIG.ENDPOINT_TYPE === 'FORMSPREE') {
//       // Formspree expects form data as form-encoded
//       const fd = new FormData();
//       Object.keys(payload).forEach(k => fd.append(k, payload[k]));
//       const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, { method: 'POST', body: fd });
//       if (res.ok) {
//         statusEl.textContent = 'Thanks — we received your inquiry. We will contact you shortly.';
//         form.reset();
//       } else {
//         throw new Error('Formspree error: ' + res.status);
//       }
//     } else if (CONFIG.ENDPOINT_TYPE === 'GAS') {
//       const res = await fetch(CONFIG.GAS_ENDPOINT, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
//       const json = await res.json();
//       if (json && json.result === 'ok') {
//         statusEl.textContent = 'Thanks — inquiry saved.';
//         form.reset();
//       } else {
//         throw new Error('GAS error');
//       }
//     } else if (CONFIG.ENDPOINT_TYPE === 'FIREBASE') {
//       const res = await fetch(CONFIG.FIREBASE_REST_ENDPOINT, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
//       if (res.ok) { statusEl.textContent = 'Thanks — inquiry saved to Firebase.'; form.reset(); }
//       else throw new Error('Firebase error');
//     } else {
//       // NONE - fallback to mailto (original behavior)
//       const subject = encodeURIComponent('Website Inquiry — ' + payload.service);
//       const body = encodeURIComponent(Object.entries(payload).map(([k,v])=>`${k}: ${v}`).join('\n'));
//       window.location.href = `mailto:birdnetjaipur@gmail.com?subject=${subject}&body=${body}`;
//       statusEl.textContent = 'Opening mail client...';
//     }
//   } catch (err) {
//     console.error(err);
//     statusEl.textContent = 'There was a problem sending your inquiry. Changes were saved locally. Please contact us directly.';
//     saveToLocal(payload);
//   }
// });

document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = {
    fname: this.fname.value,
    lname: this.lname.value,
    email: this.email.value,
    phone: this.phone.value,
    service: this.service.value,
    message: this.message.value
  };

  try {
    await fetch(CONFIG.GAS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",  // required for Google Apps Script
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    // Redirect user to thank-you page
    window.location.href = "thank-you.html";

  } catch (error) {
    alert("Something went wrong. Please try again later.");
    console.error(error);
  }
});


// saveLocalBtn.addEventListener('click', () => {
//   const payload = {
//     fname: form.fname.value.trim(),
//     lname: form.lname.value.trim(),
//     phone: form.phone.value.trim(),
//     email: form.email.value.trim(),
//     service: form.service.value,
//     message: form.message.value.trim(),
//     createdAt: new Date().toISOString()
//   };
//   saveToLocal(payload);
//   statusEl.textContent = 'Saved locally in your browser (localStorage).';
// });

// function saveToLocal(obj) {
//   const list = JSON.parse(localStorage.getItem('antiBirdLeads') || '[]');
//   list.push(obj);
//   localStorage.setItem('antiBirdLeads', JSON.stringify(list));
// }

// Optional: show saved leads (for site owner) - this is only visible in console for now
window.__showLocalLeads = function(){ console.table(JSON.parse(localStorage.getItem('antiBirdLeads')||'[]')); };

/* README - quick notes for persisting leads

1) Formspree (quickest):
   - Visit https://formspree.io and create a free form. They'll give you an endpoint like https://formspree.io/f/xxxxx
   - Put that value into CONFIG.FORMSPREE_ENDPOINT and set ENDPOINT_TYPE = 'FORMSPREE'. Submissions will be emailed.

2) Google Sheets (via Apps Script):
   - Create a new Google Apps Script bound to a Google Sheet and paste a simple doPost(e) handler that parses JSON/form data and appends a row.
   - Deploy as "Web app" (execute as: me, access: anyone, even anonymous).
   - Use the GAS endpoint URL in CONFIG and set ENDPOINT_TYPE='GAS'.

   Example Apps Script (doPost):
   function doPost(e){
     var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Sheet1');
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([new Date(), data.fname, data.lname, data.phone, data.email, data.service, data.message]);
     return ContentService.createTextOutput(JSON.stringify({result:'ok'})).setMimeType(ContentService.MimeType.JSON);
   }

3) Firebase Realtime Database / Firestore:
   - Create Firebase project, enable Realtime DB or Firestore, use REST endpoint or client SDK. Requires rules for unauthenticated writes or a token.

4) Storing on GitHub Pages (NOT directly possible):
   - GitHub Pages is static. You cannot write data to it from client-side code.
   - Options to get around:
     * Use Formspree / Google Apps Script / Firebase (recommended).
     * Use a serverless function (Netlify Functions, Vercel functions, or GitHub Actions triggered by a webhook) which then commits to your repo or stores data elsewhere.
     * Use Staticman (open-source) which allows PRs to your repo with submitted content.

*/
