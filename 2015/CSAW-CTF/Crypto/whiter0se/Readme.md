#whiter0se

**Category:** Crypto
**Points:** 50
**Description:** Note: The flag is the entire thing decrypted

[eps1.7_wh1ter0se_2b007cf0ba9881d954e85eb475d0d5e4.m4v](eps1.7_wh1ter0se_2b007cf0ba9881d954e85eb475d0d5e4.m4v)

##Write-up

Again, the file is ascii text:

>```
root@ctf:~/Downloads/CTF# file eps1.7_wh1ter0se_2b007cf0ba9881d954e85eb475d0d5e4.m4v 
eps1.7_wh1ter0se_2b007cf0ba9881d954e85eb475d0d5e4.m4v: ASCII text
root@ctf:~/Downloads/CTF# cat eps1.7_wh1ter0se_2b007cf0ba9881d954e85eb475d0d5e4.m4v
EOY XF, AY VMU M UKFNY TOY YF UFWHYKAXZ EAZZHN. UFWHYKAXZ ZNMXPHN. UFWHYKAXZ EHMOYACOI. VH'JH EHHX CFTOUHP FX VKMY'U AX CNFXY FC OU. EOY VH KMJHX'Y EHHX IFFQAXZ MY VKMY'U MEFJH OU.
>```

This looks like a single substitution cipher.  Let's try rot13 with a perl oneliner:

>```
root@ctf:~/Downloads/CTF# perl -lpe 'y/A-Za-z/N-ZA-Mn-za-m/' eps1.7_wh1ter0se_2b007cf0ba9881d954e85eb475d0d5e4.m4v
RBL KS, NL IZH Z HXSAL GBL LS HSJULXNKM RNMMUA. HSJULXNKM MAZKCUA. HSJULXNKM RUZBLNPBV. IU'WU RUUK PSGBHUC SK IXZL'H NK PASKL SP BH. RBL IU XZWUK'L RUUK VSSDNKM ZL IXZL'H ZRSWU BH.
>```

Well, that's unfortunate.  There's probably a better automated way to do it but I just put that command 26 times in a shell script and edited it for all possible values (rot1-25).  I'll spare you the agony, it didn't work.

So now we're dealing with a single substitution cipher that isn't based on rotating the charcters. To the internet! http://quipqiup.com/



