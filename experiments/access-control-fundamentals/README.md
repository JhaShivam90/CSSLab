# Access Control Fundamentals

Study and implement an access control mechanism to determine whether a subject is permitted to perform a requested operation on an object.

## Integration README

**Group**: Access Control Fundamentals  
**Experiment ID**: EXP46  
**Experiment Name**: Access Control Fundamentals  
**Folder**: `/experiments/access-control-fundamentals/`  
**Entry File**: `index.html`  
**Navigation Title**: Access Control Fundamentals  
**Short Description**: Study and implement an access control mechanism to determine whether a subject is permitted to perform a requested operation on an object using DAC, MAC, and RBAC models.  
**Required Libraries**: None  
**Input**: Access Control Model, Subject Identity, Subject Role / Clearance, Target Object, Requested Operation  
**Output**: Access decision (Grant / Deny) with audit policy log  
**Expected Navigation Link**: `/experiments/access-control-fundamentals/`

## Test Cases
- **DAC**: Input 'Alice' requesting Read on 'public_syllabus'. Outcome: Granted.
- **MAC**: Input Role 'Student' (Clearance 2) requesting Read on 'System_Kernel.bin' (Label 4). Outcome: Denied (No Read Up).
- **RBAC**: Input Role 'Faculty' requesting Write on 'System_Config.env'. Outcome: Denied.
- **XSS Prevention**: Input `<script>alert(1)</script>` as Identity. Outcome: Securely escaped and displayed without executing.

## Known Limitations
- The simulated MAC model enforces strict equality for modifications rather than full Biba/Bell-LaPadula rules for write operations to simplify the interactive simulation.
- No backend database integration; state is ephemeral and logs reset on page reload.
