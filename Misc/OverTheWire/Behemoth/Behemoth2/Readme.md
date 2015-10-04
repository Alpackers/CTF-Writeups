#Behemoth2

behemoth.labs.overthewire.org

**Username:** behemoth2
**Password:** see [behemoth1](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Behemoth/Behemoth1)
**Description:**  

This wargame deals with a lot of regular vulnerabilities found commonly 'out in the wild'. While the game makes no attempts at emulating a real environment it will teach you how to exploit several of the most common coding mistakes including buffer overflows, race conditions and privilege escalation. 

##Write-up

Let's go ahead and see what we're working with:

```
# file behemoth2 
behemoth2: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=490eca1266dce1c6fa5afd37392837976dba68ef, not stripped
```
```
# ~/checksec.sh --file behemoth2 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   behemoth2
```

Ok, we have a couple protections enabled, but they didn't really play a role in [behemoth0](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Behemoth/Behemoth0), so let's go ahead and dive in and see what this binary does.

```
# ./behemoth2 
Test
^C
# ls
20977  behemoth2
```

Pretty weird.  Didn't really do anything, but it did end up creating a file locally after I gave it some input.  Let's see what the disassembly looks like.

TODO
