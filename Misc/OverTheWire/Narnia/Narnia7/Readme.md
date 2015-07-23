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
