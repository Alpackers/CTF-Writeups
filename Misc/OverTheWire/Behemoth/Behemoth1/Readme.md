#Behemoth1

behemoth.labs.overthewire.org

**Username:** behemoth1
**Password:** see [behemoth0](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Behemoth/Behemoth0)
**Description:**  

This wargame deals with a lot of regular vulnerabilities found commonly 'out in the wild'. While the game makes no attempts at emulating a real environment it will teach you how to exploit several of the most common coding mistakes including buffer overflows, race conditions and privilege escalation. 

##Write-up

Let's go ahead and see what we're working with:

```
# file behemoth1 
behemoth1: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=6b301db8057be8df8ceead844e81f05764289f92, not stripped
```
```
# ~/checksec.sh --file behemoth1 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        No canary found   NX disabled   No PIE          No RPATH   No RUNPATH   behemoth1
```

```
# ./behemoth1
Password: AAAAAAAAAA
Authentication failure.
Sorry.
```

TODO
