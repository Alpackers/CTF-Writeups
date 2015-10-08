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

```asm
             main:
0804856d         push       ebp                                                 ; XREF=_start+23
0804856e         mov        ebp, esp
08048570         and        esp, 0xfffffff0
08048573         sub        esp, 0xa0
08048579         mov        eax, dword [gs:0x14]
0804857f         mov        dword [ss:esp+0x9c], eax
08048586         xor        eax, eax
08048588         call       j_getpid
0804858d         mov        dword [ss:esp+0x1c], eax
08048591         lea        eax, dword [ss:esp+0x24]
08048595         add        eax, 0x6
08048598         mov        dword [ss:esp+0x20], eax
0804859c         mov        eax, dword [ss:esp+0x1c]
080485a0         mov        dword [ss:esp+0x8], eax
080485a4         mov        dword [ss:esp+0x4], 0x804870c                       ; "touch %d", argument "format" for method j_sprintf
080485ac         lea        eax, dword [ss:esp+0x24]
080485b0         mov        dword [ss:esp], eax                                 ; argument "str" for method j_sprintf
080485b3         call       j_sprintf
080485b8         lea        eax, dword [ss:esp+0x38]
080485bc         mov        dword [ss:esp+0x4], eax                             ; argument #2 for method __lstat
080485c0         mov        eax, dword [ss:esp+0x20]
080485c4         mov        dword [ss:esp], eax                                 ; argument #1 for method __lstat
080485c7         call       __lstat
080485cc         and        eax, 0xf000
080485d1         cmp        eax, 0x8000
080485d6         je         0x80485f0

080485d8         mov        eax, dword [ss:esp+0x20]
080485dc         mov        dword [ss:esp], eax                                 ; argument "path" for method j_unlink
080485df         call       j_unlink
080485e4         lea        eax, dword [ss:esp+0x24]
080485e8         mov        dword [ss:esp], eax                                 ; argument "command" for method j_system
080485eb         call       j_system

080485f0         mov        dword [ss:esp], 0x7d0                               ; argument "seconds" for method j_sleep, XREF=main+105
080485f7         call       j_sleep
080485fc         lea        eax, dword [ss:esp+0x24]
08048600         mov        dword [ds:eax], 0x20746163
08048606         mov        byte [ds:eax+0x4], 0x0
0804860a         mov        byte [ss:esp+0x28], 0x20
0804860f         lea        eax, dword [ss:esp+0x24]
08048613         mov        dword [ss:esp], eax                                 ; argument "command" for method j_system
08048616         call       j_system
0804861b         mov        eax, 0x0
08048620         mov        edx, dword [ss:esp+0x9c]
08048627         xor        edx, dword [gs:0x14]
0804862e         je         0x8048635

08048630         call       j___stack_chk_fail

08048635         leave                                                          ; XREF=main+193
08048636         ret        
                        ; endp
```

Ok, we have a few things to track down here.  We can see a call to ```getpid```, ```sprintf```, ```lstat```, ```unlink```, ```system```, and ```sleep```.  I'm not 100% sure what ```lstat``` and ```unlink``` do, so let's take a look at them first.  Starting with ```lstat```, we can see that it is used to determine information about a file based on its filename.  Next we have ```unlink``` which appears to remove a link to a file if it exists.

TODO
