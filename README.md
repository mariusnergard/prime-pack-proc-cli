# prime-pack-proc-cli

A CLI tool for Nexus PRIME to pack BPMN processes with dependencies like forms and scripts to a importable script.
This must be used on an extracted PRIME configuration package.

Install globally
```npm i @mnergard/prime-pack-proc-cli -g```

Navigate to the **processes** folder in the extracted configuration and run the following command to pack a process to a .zip file:
```prime-pack-proc <process_filename>.bpmn```

Only BPMN processes are supported (no ad-hoc procs).

The file <process_filename>.zip will be created in the working directory. 

Add the argument ```--includeSub``` to include any sub-processes
```prime-pack-proc <process_filename>.bpmn --includeSub```
