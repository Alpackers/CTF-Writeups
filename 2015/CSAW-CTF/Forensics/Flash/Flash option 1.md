#Flash

**Category:** Forensics 
**Points:** 100 
**Description:** 

We were able to grab an image of a harddrive. Find out what's on it.

##Write-up
Based on the information provided it appears that we will be dealing with an [image](https://en.wikipedia.org/wiki/Disk_image) of a flash hard drive so I am expecting that I will be using forensic software to analyze the file.

My first step was to download the image file and examine it with standard forensic software. The image file contained approximately 190 files and folders which included several hidden folder/file types. Since we are looking for the 'flag' I created a search operation to be run against all files (including hidden files) to search for the term ‘flag‘. This search returned 397 hits from within 43 files so I knew I needed to narrow the results.

I created a second search operation to also be run against all files (including hidden files) this time searching for the term ‘flag{‘. This search resulted in one hit within one file and the flag was immediately located in the following hidden file ‘Disk Image\.10\.hidden’ 

The flag recovered to solve this CTF is ```flag{b3l0w_th3_r4dar}```
