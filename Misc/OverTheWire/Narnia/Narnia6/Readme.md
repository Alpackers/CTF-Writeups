#Narnia6

narnia.labs.overthewire.org

**Username:** narnia6
**Password:** see [narnia5](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria5)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

>```
# ./narnia6
./narnia6 b1 b2
>```
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
