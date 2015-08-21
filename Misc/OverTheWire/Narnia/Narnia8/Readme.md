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
> Hmmmm.  We didn't get a seg fault, but we got some weird characters added in with out ```A```.  Let's try a bit bigger.
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
> TODO
