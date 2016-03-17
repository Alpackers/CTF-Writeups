#lily.flac

**Category:** Misc
**Points:** 2
**Description:**

more than just a few bleebs ;)

##Write-up
In this challege we were provided with an [flac](./lily.flac) audio file.  After listening to the file, we opened it up with ```audacity``` and tried to look for any hidden messages or patterns.

![Spectrogram](./Images/lily.png)

After hours and hours of messing with this file we finally turned too other writeups for some clues.  As it turns out the noise in the begining is really the header of an ELF file.  If we use ```sox``` to strip off the flac headers and look at the file type we will see that it is indeed just a binary.  Modify the permissions and executing the binary yields the flag.

```
root@kali:~# sox lily.flac lily.raw
root@kali:~# file lily.raw 
lily.raw: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=d089edfc986a3cbdb64e3d9c65717a5f4209e13f, not stripped
root@kali:~# chmod +x lily.raw 
root@kali:~# ./lily.raw 
BKPCTF{hype for a Merzbow/FSF collab album??}
```
