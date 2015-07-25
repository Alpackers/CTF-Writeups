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
