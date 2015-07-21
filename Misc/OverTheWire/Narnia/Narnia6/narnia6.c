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
#include <string.h>

extern char **environ;

// tired of fixing values...
// - morla
unsigned long get_sp(void) {
       __asm__("movl %esp,%eax\n\t"
               "and $0xff000000, %eax"
               );
}

int main(int argc, char *argv[]){
	char b1[8], b2[8];
	int  (*fp)(char *)=(int(*)(char *))&puts, i;

	if(argc!=3){ printf("%s b1 b2\n", argv[0]); exit(-1); }

	/* clear environ */
	for(i=0; environ[i] != NULL; i++)
		memset(environ[i], '\0', strlen(environ[i]));
	/* clear argz    */
	for(i=3; argv[i] != NULL; i++)
		memset(argv[i], '\0', strlen(argv[i]));

	strcpy(b1,argv[1]);
	strcpy(b2,argv[2]);
	//if(((unsigned long)fp & 0xff000000) == 0xff000000)
	if(((unsigned long)fp & 0xff000000) == get_sp())
		exit(-1);
	fp(b1);

	exit(1);
}
