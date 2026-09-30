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
      const identity = identityInput ? identityInput.value.trim() || 'Unknown' : 'Unknown';
      const role = roleSelect.value;
      const obj = objSelect.value;
      const op = opSelect.value;

      let granted = false;
      let reason = '';

      if (role === 'admin') {
        if (obj === 'system_kernel' && op !== 'execute') {
           granted = false;
           reason = 'Admin can only execute the kernel, not read/write/delete it directly.';
        } else {
           granted = true;
           reason = 'Administrator possesses unrestricted access rights for this operation.';
        }
      } else if (role === 'faculty') {
        if (obj === 'system_config' || obj === 'system_kernel') {
          granted = (op === 'read' && obj !== 'system_kernel');
          reason = op === 'read' && obj !== 'system_kernel' ? 'Faculty allowed read access to configuration.' : 'Faculty denied access to core system files.';
        } else {
          granted = true;
          reason = 'Faculty allowed full access on academic files.';
        }
      } else if (role === 'student') {
        if (obj === 'public_syllabus') {
          granted = (op === 'read');
          reason = op === 'read' ? 'Students can read syllabus.' : 'Students cannot modify syllabus.';
        } else {
          granted = false;
          reason = 'Students have no access to restricted resources.';
        }
      } else {
        // guest
        if (obj === 'public_syllabus' && op === 'read') {
          granted = true;
          reason = 'Public syllabus accessible to guests.';
        } else {
          granted = false;
          reason = 'Guests denied access to restricted resources.';
        }
      }

      const timestamp = new Date().toISOString();
      const statusHtml = granted ? '<span style="color:#15803d; font-weight:bold; font-size:1.1rem;">&#10004; ACCESS GRANTED</span>' : '<span style="color:#b91c1c; font-weight:bold; font-size:1.1rem;">&#10008; ACCESS DENIED</span>';

      output.innerHTML = `
        <p><strong>Evaluation Result:</strong> ${statusHtml}</p>
        <p><strong>Subject Identity:</strong> ${identity} | <strong>Role:</strong> ${role.toUpperCase()}</p>
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
        logEntry.innerHTML = `[${timestamp}] User: <strong>${identity}</strong> (${role}) | Action: <strong>${op.toUpperCase()}</strong> on <strong>${obj}</strong> &rarr; <span style="color:${color};">[${actionStatus}]</span>`;
        auditLog.prepend(logEntry);
      }
    });
  }
});
