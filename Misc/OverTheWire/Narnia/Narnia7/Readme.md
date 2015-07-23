#Narnia7

narnia.labs.overthewire.org

**Username:** narnia7
**Password:** see [narnia6](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia/Naria6)
**Description:**  
> This wargame is for the ones that want to learn basic exploitation. You can see the most common bugs in this game and we've tried to make them easy to exploit. You'll get the source code of each level to make it easier for you to spot the vuln and abuse it.  

##Write-up

> Let's go ahead and run the program and see what it does.
>
>```
# ./narnia7 AAAA
goodfunction() = 0x80486e0
hackedfunction() = 0x8048706
>
before : ptrf() = 0x80486e0 (0xff9a7f5c)
I guess you want to come to the hackedfunction...
Welcome to the goodfunction, but i said the Hackedfunction..
>```
>
> Well, we can see what appears to be the addresses of a good function and hacked function and a reference to another address. No sign of our user-supplied input though. Let's look at the source and see if we can pick out what's going on.
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
#include <stdlib.h>
#include <unistd.h>
>
int goodfunction();
int hackedfunction();
>
int vuln(const char *format){
        char buffer[128];
        int (*ptrf)();
>
        memset(buffer, 0, sizeof(buffer));
        printf("goodfunction() = %p\n", goodfunction);
        printf("hackedfunction() = %p\n\n", hackedfunction);
>
        ptrf = goodfunction;
        printf("before : ptrf() = %p (%p)\n", ptrf, &ptrf);
>
        printf("I guess you want to come to the hackedfunction...\n");
        sleep(2);
        ptrf = goodfunction;
>  
        snprintf(buffer, sizeof buffer, format);
>
        return ptrf();
}
>
int main(int argc, char **argv){
        if (argc <= 1){
                fprintf(stderr, "Usage: %s <buffer>\n", argv[0]);
                exit(-1);
        }
        exit(vuln(argv[1]));
}
>
int goodfunction(){
        printf("Welcome to the goodfunction, but i said the Hackedfunction..\n");
        fflush(stdout);
>        
        return 0;
}
>
int hackedfunction(){
        printf("Way to go!!!!");
	fflush(stdout);
        system("/bin/sh");
>
        return 0;
}
>```
>
> Ok, it seems pretty obvious looking at this code that we need to change ```ptrf``` from pointing to ```goodfunction``` to ```hackedfunction```.  Our input appears to be passed in directly to the ```snprintf``` function and is being used as the format value.  Sounds like we will be working on another string format issue.  Let's poke around at that first.
>
>```
# ./narnia7 $(python -c 'print "AAAA"+"%x"*10')
goodfunction() = 0x80486e0
hackedfunction() = 0x8048706
>
before : ptrf() = 0x80486e0 (0xffa2277c)
I guess you want to come to the hackedfunction...
Welcome to the goodfunction, but i said the Hackedfunction..
# ./narnia7 $(python -c 'print "AAAA"+"%x"*100')
goodfunction() = 0x80486e0
hackedfunction() = 0x8048706
>
before : ptrf() = 0x80486e0 (0xfffc721c)
I guess you want to come to the hackedfunction...
Welcome to the goodfunction, but i said the Hackedfunction..
# ./narnia7 $(python -c 'print "AAAA"*1000')
goodfunction() = 0x80486e0
hackedfunction() = 0x8048706
>
before : ptrf() = 0x80486e0 (0xff9f57ac)
I guess you want to come to the hackedfunction...
Welcome to the goodfunction, but i said the Hackedfunction..
>```
>
> Hmmm.  Nothing seems to be affecting it.  Even inserting 1000 ```A``` didn't phase it.  Looks like I'm going to have to do some more reseach on string format vulnerabilities.
>
> Here's a great article: [Format String Exploitation-Tutorial](https://www.exploit-db.com/docs/28476.pdf)
>
> Let's try some of the stuff they are doing in there.
>
>```
# ltrace ./narnia7 $(python -c 'print "AAAA"+"%x"*10')
__libc_start_main(0x804868f, 2, 0xff942074, 0x8048740, 0x80487b0 <unfinished ...>
memset(0xff941f20, '\000', 128)                              = 0xff941f20
printf("goodfunction() = %p\n", 0x80486e0goodfunction() = 0x80486e0
)                   = 27
printf("hackedfunction() = %p\n\n", 0x8048706hackedfunction() = 0x8048706
>
)               = 30
printf("before : ptrf() = %p (%p)\n", 0x80486e0, 0xff941f1cbefore : ptrf() = 0x80486e0 (0xff941f1c)
) = 41
puts("I guess you want to come to the "...I guess you want to come to the hackedfunction...
)                  = 50
sleep(2)                                                     = 0
snprintf("AAAA8a2f77acb58f77ac86080482fd80"..., 128, "AAAA%x%x%x%x%x%x%x%x%x%x", 0x8a2, 0xf77acb58, 0xf77ac860, 0x80482fd, 0x80486e0, 0x41414141, 0x66326138, 0x63613737, 0x66383562, 0x63613737) = 77
puts("Welcome to the goodfunction, but"...Welcome to the goodfunction, but i said the Hackedfunction..
)                  = 61
fflush(0xf77884e0)                                           = 0
exit(0 <unfinished ...>
+++ exited (status 0) +++
>```
>
> TODO
