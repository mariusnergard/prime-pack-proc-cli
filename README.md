# prime-pack-proc-cli

A CLI tool for Nexus PRIME to pack BPMN processes with dependencies like forms and scripts to a importable script.<br>
This must be used on an extracted PRIME configuration package.<br>

Install globally<br>
```npm i @mnergard/prime-pack-proc-cli -g```<br>

Navigate you command line to the **processes** folder in the extracted configuration and run the following command to pack a process to a .zip file:<br>
```prime-pack-proc <process_filename>.bpmn```<br>

Only BPMN processes are supported (no ad-hoc procs)!<br>

The file <process_filename>.zip will be created in the working directory.<br>

```
example.zip
|-- forms\
|   |   exampleForm.xml
|-- permissions\
|   |-- forms\
|   |   |   exampleForm_permissions.xml
|   |-- processes\
|   |   |   exampleProc_permissions.xml
|-- processes\
|   |   exampleProc.bpmn
|   |-- mappings\
|   |   |   exampleProc.xml
|-- scripts\
|   |   exampleScript.xml
```

Add the argument ```--includeSub``` to include any sub-processes<br>
```prime-pack-proc <process_filename>.bpmn --includeSub```<br>
