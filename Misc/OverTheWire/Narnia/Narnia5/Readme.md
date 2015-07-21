#Narnia5

narnia.labs.overthewire.org

**Username:** narnia5
**Password:** see [narnia4](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria4)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Just running the program provides us a little bit of a hint.
>
>```
# ./narnia5
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [] (0)
i = 1 (0xffb60dbc)
>```
>
> Peeking at the code we see:
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
> 
int main(int argc, char **argv){
	int i = 1;
	char buffer[64];
>
	snprintf(buffer, sizeof buffer, argv[1]);
	buffer[sizeof (buffer) - 1] = 0;
	printf("Change i's value from 1 -> 500. ");
>
	if(i==500){
		printf("GOOD\n");
		system("/bin/sh");
	}
>
	printf("No way...let me give you a hint!\n");
	printf("buffer : [%s] (%d)\n", buffer, strlen(buffer));
	printf ("i = %d (%p)\n", i, &i);
	return 0;
}
>```
> 
> Ok, looks like we need to manipulate the value of ```i```.  There is a lot of ```printf``` usage.  Let's try some basic string format entries.
>
>```
# ./narnia5 %x%x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [f76b9960ffb1f4e6] (16)
i = 1 (0xffb1f50c)
>```
>
> Looks like the right track.  Let's see if we can find our way back up the stack to our input.
>
>```
# ./narnia5 AAAA%x%x%x%x%x%x%x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [AAAAf7650960ffbff5f6f75fe315ffbff5f7414141413536376630363930] (60)
i = 1 (0xffbff61c)
# ./narnia5 AAAA%x%x%x%x%x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [AAAAf767f960ff81c7c6f762d315ff81c7c741414141] (44)
i = 1 (0xff81c7ec)
>```
>
> Looks like we have to read 5 times before we get back to our input.  Now we need to locate where ```i``` resides in memory to attempt to change the value.  Let's run our dissassembler and find a good break point.
>
>```asm
 main:
080484bd         push       ebp                                                 ; XREF=_start+23
080484be         mov        ebp, esp
080484c0         and        esp, 0xfffffff0
080484c3         sub        esp, 0x60
080484c6         mov        dword [ss:esp+0x5c], 0x1
080484ce         mov        eax, dword [ss:ebp+arg_4]
080484d1         add        eax, 0x4
080484d4         mov        eax, dword [ds:eax]
080484d6         mov        dword [ss:esp+0x8], eax                             ; argument "format" for method j_snprintf
080484da         mov        dword [ss:esp+0x4], 0x40                            ; argument "size" for method j_snprintf
080484e2         lea        eax, dword [ss:esp+0x1c]
080484e6         mov        dword [ss:esp], eax                                 ; argument "str" for method j_snprintf
080484e9         call       j_snprintf
080484ee         mov        byte [ss:esp+0x5b], 0x0
080484f3         mov        dword [ss:esp], 0x8048610                           ; "Change i's value from 1 -> 500. ", argument "format" for method j_printf
080484fa         call       j_printf
080484ff         mov        eax, dword [ss:esp+0x5c]
08048503         cmp        eax, 0x1f4
08048508         jne        0x8048522
>
0804850a         mov        dword [ss:esp], 0x8048631                           ; argument "s" for method j_puts
08048511         call       j_puts
08048516         mov        dword [ss:esp], 0x8048636                           ; "/bin/sh", argument "command" for method j_system
0804851d         call       j_system
>```
>
> Let's stop at the comparison between ```i``` and ```500``` at ```0x08048503```.
>
>```
(gdb) run
Starting program: /root/narnia5 
>
Breakpoint 1, 0x08048503 in main ()
(gdb) print/a $eax
$2 = 0x1
(gdb) print/a $esp+0x5c
$3 = 0xffffd4fc
>```
>
> Well it looks like the value of ```i``` is sitting at ```0xffffd4fc```.  Let's see if we can use the string format vulnerability to overwrite it.
>
> TODO
