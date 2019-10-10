# prime-pack-proc-cli

A CLI tool for Nexus PRIME to pack BPMN processes with dependencies like forms and scripts to a importable zip-file.<br>
This must be used on an extracted PRIME configuration package.<br><br>

Install globally<br>
```npm i @mnergard/prime-pack-proc-cli -g```<br><br>

Navigate to the **processes** folder in the extracted configuration and run the following command to pack a process to a .zip file:<br>
```prime-pack-proc <process_filename>.bpmn```<br><br>

Only BPMN processes are supported (no ad-hoc procs).<br><br>

The file <process_filename>.zip will be created in the working directory.<br><br>

Add the argument ```--includeSub``` to include any sub-processes<br>
```prime-pack-proc <process_filename>.bpmn --includeSub```<br><br>
