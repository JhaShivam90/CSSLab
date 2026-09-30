document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnEvalAccess');
  const identityInput = document.getElementById('subIdentity');
  const roleSelect = document.getElementById('subRole');
  const objSelect = document.getElementById('targetObj');
  const opSelect = document.getElementById('opType');
  const output = document.getElementById('accessOutput');
  const auditLog = document.getElementById('auditLog');

  if (btn && roleSelect && objSelect && opSelect && output) {
    btn.addEventListener('click', () => {
      // Security: Escape user inputs to prevent XSS (Cross-Site Scripting)
      const escapeHTML = (str) => str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
          }[tag] || tag)
      );

      const rawIdentity = identityInput ? identityInput.value.trim() || 'Unknown' : 'Unknown';
      const identity = escapeHTML(rawIdentity);
      const role = roleSelect.value;
      const obj = objSelect.value;
      const op = opSelect.value;

      const acModelSelect = document.getElementById('acModel');
      const acModel = acModelSelect ? acModelSelect.value : 'rbac';
      
      let granted = false;
      let reason = '';

      if (acModel === 'dac') {
        // Discretionary Access Control (DAC)
        const dacOwners = {
          'public_syllabus': 'alice',
          'lab_assignment': 'bob',
          'system_config': 'admin',
          'system_kernel': 'root'
        };
        const owner = dacOwners[obj];
        const lowerIdentity = identity.toLowerCase();
        
        if (lowerIdentity === owner) {
          granted = true;
          reason = `DAC: ${identity} is the owner of ${obj}. Full access granted.`;
        } else if (obj === 'public_syllabus' && op === 'read') {
          granted = true;
          reason = `DAC: Access Control List (ACL) allows public read access to ${obj}.`;
        } else {
          granted = false;
          reason = `DAC: ${identity} is not the owner of ${obj}. Access denied.`;
        }

      } else if (acModel === 'mac') {
        // Mandatory Access Control (MAC)
        const clearanceLevels = { 'admin': 4, 'faculty': 3, 'student': 2, 'guest': 1 };
        const objectLabels = { 'system_kernel': 4, 'system_config': 3, 'lab_assignment': 2, 'public_syllabus': 1 };
        
        const subjClearance = clearanceLevels[role];
        const objLabel = objectLabels[obj];
        
        if (op === 'read') {
          granted = subjClearance >= objLabel; // Read Down
          reason = granted ? `MAC: Subject clearance (${role}) &ge; Object classification.` : `MAC: Subject clearance (${role}) is lower than Object classification.`;
        } else {
          // For simplicity in this lab, modifications require exact clearance match
          granted = subjClearance === objLabel;
          reason = granted ? `MAC: Subject clearance matches Object classification for ${op}.` : `MAC: Exact clearance match required for modification/execution (Integrity rules).`;
        }

      } else {
        // Role-Based Access Control (RBAC)
        if (role === 'admin') {
          if (obj === 'system_kernel' && op !== 'execute') {
             granted = false;
             reason = 'RBAC: Admin can only execute the kernel, not read/write/delete it directly.';
          } else {
             granted = true;
             reason = 'RBAC: Administrator possesses unrestricted access rights for this operation.';
          }
        } else if (role === 'faculty') {
          if (obj === 'system_config' || obj === 'system_kernel') {
            granted = (op === 'read' && obj !== 'system_kernel');
            reason = op === 'read' && obj !== 'system_kernel' ? 'RBAC: Faculty allowed read access to configuration.' : 'RBAC: Faculty denied access to core system files.';
          } else {
            granted = true;
            reason = 'RBAC: Faculty allowed full access on academic files.';
          }
        } else if (role === 'student') {
          if (obj === 'public_syllabus') {
            granted = (op === 'read');
            reason = op === 'read' ? 'RBAC: Students can read syllabus.' : 'RBAC: Students cannot modify syllabus.';
          } else {
            granted = false;
            reason = 'RBAC: Students have no access to restricted resources.';
          }
        } else {
          // guest
          if (obj === 'public_syllabus' && op === 'read') {
            granted = true;
            reason = 'RBAC: Public syllabus accessible to guests.';
          } else {
            granted = false;
            reason = 'RBAC: Guests denied access to restricted resources.';
          }
        }
      }

      const timestamp = new Date().toISOString();
      const statusHtml = granted ? '<span style="color:#15803d; font-weight:bold; font-size:1.1rem;">&#10004; ACCESS GRANTED</span>' : '<span style="color:#b91c1c; font-weight:bold; font-size:1.1rem;">&#10008; ACCESS DENIED</span>';
      const modelName = acModel.toUpperCase();

      output.innerHTML = `
        <p><strong>Evaluation Result:</strong> ${statusHtml}</p>
        <p><strong>Model:</strong> ${modelName} | <strong>Subject:</strong> ${identity} (${role.toUpperCase()})</p>
        <p><strong>Object:</strong> ${obj} | <strong>Operation:</strong> ${op.toUpperCase()}</p>
        <p><strong>Policy Reason:</strong> ${reason}</p>
      `;

      if (auditLog) {
        const logEntry = document.createElement('li');
        logEntry.style.paddingBottom = '5px';
        logEntry.style.borderBottom = '1px solid #ccc';
        logEntry.style.marginBottom = '5px';
        const actionStatus = granted ? 'GRANTED' : 'DENIED';
        const color = granted ? 'green' : 'red';
        logEntry.innerHTML = `[${timestamp}] <strong>[${modelName}]</strong> User: <strong>${identity}</strong> (${role}) | Action: <strong>${op.toUpperCase()}</strong> on <strong>${obj}</strong> &rarr; <span style="color:${color};">[${actionStatus}]</span>`;
        auditLog.prepend(logEntry);
      }
    });
  }
});
