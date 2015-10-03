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

```asm
             main:
0804845d         push       ebp                                                 ; XREF=_start+23
0804845e         mov        ebp, esp
08048460         and        esp, 0xfffffff0
08048463         sub        esp, 0x60
08048466         mov        dword [ss:esp], 0x8048530                           ; "Password: ", argument "format" for method j_printf
0804846d         call       j_printf
08048472         lea        eax, dword [ss:esp+0x1d]
08048476         mov        dword [ss:esp], eax                                 ; argument "str" for method j_gets
08048479         call       j_gets
0804847e         mov        dword [ss:esp], 0x804853c                           ; "Authentication failure.\\nSorry.", argument "s" for method j_puts
08048485         call       j_puts
0804848a         mov        eax, 0x0
0804848f         leave      
08048490         ret        
                        ; endp
```

```
# python -c 'print "A"*300' > input
(gdb) run < input
Starting program: /root/CTF/OverTheWire/behemoth/behemoth1 < input
Password: Authentication failure.
Sorry.

Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
```

TODO
