---
title: "AC CTF - Fire and Ice"
date: "2025-11-09"
author: "someone"
platform: "CTFd"
difficulty: "TBD"
category: Forensics"
tags: [zip, nested files]
target: ""
---

# TL;DR
Alright so we received a .zip file which unzipped contained flag.txt which contained a wrong flag. S i binwalked the original zip file and saw 3 more zips and the last one unzipped contained the flag.

```
binwalk -e adofai.zip 

                     /home/th3mujd11/Downloads/extractions/adofai.zip
------------------------------------------------------------------------------------------
DECIMAL                            HEXADECIMAL                        DESCRIPTION
------------------------------------------------------------------------------------------
0                                  0x0                                ZIP archive, file 
                                                                      count: 1, total 
                                                                      size: 226 bytes
226                                0xE2                               ZIP archive, file 
                                                                      count: 1, total 
                                                                      size: 227 bytes
453                                0x1C5                              ZIP archive, file 
                                                                      count: 1, total 
                                                                      size: 226 bytes
------------------------------------------------------------------------------------------
[+] Extraction of zip data at offset 0x0 completed successfully
[+] Extraction of zip data at offset 0xE2 completed successfully
[+] Extraction of zip data at offset 0x1C5 completed successfully
------------------------------------------------------------------------------------------

Analyzed 1 file for 85 file signatures (187 magic patterns) in 35.0 milliseconds

ctf{281dbf950ada8e90f9320071fd871af042fd67d3bdf94043640b9ae673d0c952}
```

---

