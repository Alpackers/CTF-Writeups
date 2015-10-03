#Behemoth0

behemoth.labs.overthewire.org

**Username:** behemoth0
**Password:** behemoth0
**Description:**  

This wargame deals with a lot of regular vulnerabilities found commonly 'out in the wild'. While the game makes no attempts at emulating a real environment it will teach you how to exploit several of the most common coding mistakes including buffer overflows, race conditions and privilege escalation. 

##Write-up

Let's go ahead and see what we're working with:

```
# file behemoth0 
behemoth0: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=4c2e0281c9220ac21b55994f2a2408fe3c6693ac, not stripped
```

Ok, nothing special yet, pretty much what we were used to with [narnia](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia) challenges.  Having been frustrated recently with so security protections I figured I would go ahead and see what was turned on.

```
# ~/checksec.sh --file behemoth0 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   behemoth0
```

Looks like there is a ```canary``` and ```NX``` is turned on.  We may or may not have to bypass them...time will tell.  Now, just to run it and see what we're up against.

```
# ./behemoth0 
Password: AAAAAAAAA
Access denied..
```

Just from execution it looks like we probably just need to find the correct password.  Let's go ahead and disassemble main and see what it looks like.

```asm
             main:
080485a2         push       ebp                                                 ; XREF=_start+23
080485a3         mov        ebp, esp
080485a5         and        esp, 0xfffffff0
080485a8         sub        esp, 0x70
080485ab         mov        eax, dword [gs:0x14]
080485b1         mov        dword [ss:esp+0x6c], eax
080485b5         xor        eax, eax
080485b7         mov        dword [ss:esp+0x1f], 0x475e4b4f
080485bf         mov        dword [ss:esp+0x23], 0x45425953
080485c7         mov        dword [ss:esp+0x27], 0x595e58
080485cf         mov        dword [ss:esp+0x10], 0x8048720                      ; "unixisbetterthanwindows"
080485d7         mov        dword [ss:esp+0x14], 0x8048738                      ; "followthewhiterabbit"
080485df         mov        dword [ss:esp+0x18], 0x804874d                      ; "pacmanishighoncrack"
080485e7         mov        dword [ss:esp], 0x8048761                           ; "Password: ", argument "format" for method j_printf
080485ee         call       j_printf
080485f3         lea        eax, dword [ss:esp+0x2b]
080485f7         mov        dword [ss:esp+0x4], eax
080485fb         mov        dword [ss:esp], 0x804876c
08048602         call       j___isoc99_scanf
08048607         lea        eax, dword [ss:esp+0x1f]
0804860b         mov        dword [ss:esp], eax                                 ; argument "s" for method j_strlen
0804860e         call       j_strlen
08048613         mov        dword [ss:esp+0x4], eax                             ; argument #2 for method memfrob
08048617         lea        eax, dword [ss:esp+0x1f]
0804861b         mov        dword [ss:esp], eax                                 ; argument #1 for method memfrob
0804861e         call       memfrob
08048623         lea        eax, dword [ss:esp+0x1f]
08048627         mov        dword [ss:esp+0x4], eax                             ; argument "s2" for method j_strcmp
0804862b         lea        eax, dword [ss:esp+0x2b]
0804862f         mov        dword [ss:esp], eax                                 ; argument "s1" for method j_strcmp
08048632         call       j_strcmp
08048637         test       eax, eax
08048639         jne        0x8048665

0804863b         mov        dword [ss:esp], 0x8048771                           ; "Access granted..", argument "s" for method j_puts
08048642         call       j_puts
08048647         mov        dword [ss:esp+0x8], 0x0
0804864f         mov        dword [ss:esp+0x4], 0x8048782                       ; argument "arg0" for method j_execl
08048657         mov        dword [ss:esp], 0x8048785                           ; argument "path" for method j_execl
0804865e         call       j_execl
08048663         jmp        0x8048671

08048665         mov        dword [ss:esp], 0x804878d                           ; "Access denied..", argument "s" for method j_puts, XREF=main+151
0804866c         call       j_puts

08048671         mov        eax, 0x0                                            ; XREF=main+193
08048676         mov        edx, dword [ss:esp+0x6c]
0804867a         xor        edx, dword [gs:0x14]
08048681         je         0x8048688

08048683         call       j___stack_chk_fail

08048688         leave                                                          ; XREF=main+223
08048689         ret        
                        ; endp
```

I saw a few strings at the top of main that looked like they may be passwords.  Let's give them a shot.

```
# ./behemoth0 
Password: unixisbetterthanwindows
Access denied..
# ./behemoth0 
Password: followthewhiterabbit
Access denied..
# ./behemoth0 
Password: pacmanishighoncrack
Access denied..
```

Well, worth a shot anyway.  Now let's acutally do some digging.  Looks like a string comparison is what determines if we have the correct password or not.  We should be able to set a breakpoint in ```gdb``` and see what's on the stack right at the call to ```j_strcmp```.  This is similiar to the type of logic in a few of the [microcorruption](https://microcorruption.com/login) challenges.

```asm
08048627         mov        dword [ss:esp+0x4], eax                             ; argument "s2" for method j_strcmp
0804862b         lea        eax, dword [ss:esp+0x2b]
0804862f         mov        dword [ss:esp], eax                                 ; argument "s1" for method j_strcmp
08048632         call       j_strcmp
08048637         test       eax, eax
08048639         jne        0x8048665
```

```
(gdb) break * 0x08048632
Breakpoint 1 at 0x8048632
(gdb) run
Starting program: /root/CTF/OverTheWire/behemoth/behemoth0 
Password: AAAAAAAAAA
>
Breakpoint 1, 0x08048632 in main ()
(gdb) x/50x $esp
0xffffd1e0:	0xffffd20b	0xffffd1ff	0xffffd200	0x080482d2
0xffffd1f0:	0x08048720	0x08048738	0x0804874d	0x65e9f586
0xffffd200:	0x796d7461	0x726f6873	0x41007374	0x41414141
0xffffd210:	0x41414141	0x00ca0041	0x00000001	0x080483c5
0xffffd220:	0xffffd46d	0x0000002f	0x0804999c	0x080486e2
0xffffd230:	0x00000001	0xffffd2f4	0xffffd2fc	0xf7e3c39d
0xffffd240:	0xf7fb13c4	0xf7ffd000	0x0804869b	0xfd956100
0xffffd250:	0x08048690	0x00000000	0x00000000	0xf7e24a63
0xffffd260:	0x00000001	0xffffd2f4	0xffffd2fc	0xf7feb7da
0xffffd270:	0x00000001	0xffffd2f4	0xffffd294	0x080499c0
0xffffd280:	0x08048270	0xf7fb1000	0x00000000	0x00000000
0xffffd290:	0x00000000	0x8e3b8a48	0xb50b0e58	0x00000000
0xffffd2a0:	0x00000000	0x00000000
```

Ok, here we are.  We can clearly see our input on the stack in the form of ```0x41414141```, but nothing else really stands out in this format.  When I'm expecting a string I like to use ```xxd``` to view to stack, so let's go ahead and set that up and see what we get.

```
(gdb) define xxd
Type commands for definition of "xxd".
End with a line saying just "end".
>dump binary memory dump.bin $arg0 $arg0+$arg1
>shell xxd dump.bin
>end
(gdb) xxd $esp 100
0000000: 0bd2 ffff ffd1 ffff 00d2 ffff d282 0408  ................
0000010: 2087 0408 3887 0408 4d87 0408 86f5 e965   ...8...M......e
0000020: 6174 6d79 7368 6f72 7473 0041 4141 4141  atmyshorts.AAAAA
0000030: 4141 4141 4100 ca00 0100 0000 c583 0408  AAAAA...........
0000040: 6dd4 ffff 2f00 0000 9c99 0408 e286 0408  m.../...........
0000050: 0100 0000 f4d2 ffff fcd2 ffff 9dc3 e3f7  ................
0000060: c413 fbf7                                ....
(gdb) 
```

Ok, now that appears pretty clear.  We can see the string ```eatmyshorts``` directly before our input.  Now to try it.

```
# ./behemoth0 
Password: eatmyshorts
Access granted..
# exit
```

Perfect.  This was local, so let's head to the server and try it out.

```
behemoth0@melinda:/behemoth$ ./behemoth0 
Password: eatmyshorts
Access granted..
$ whoami
behemoth1
$ cat /etc/behemoth_pass/behemoth1
**********
$ 
```

That was pretty easy, but a nice change of pace from the last two [narnia](https://github.com/Alpackers/CTF-Writeups/tree/master/Misc/OverTheWire/Narnia) challenges that were pretty challenging to me.  On to behemoth1.
