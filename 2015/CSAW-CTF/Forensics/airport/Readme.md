#Airport

**Category:** Forensics
**Points:** 200
**Description:** NA

[airport_26321e6eac7a7490e527cbe27ceb68c1.zip](airport_26321e6eac7a7490e527cbe27ceb68c1.zip)

##Write-up
We get our first clue from hitting the link in the description.

![Image of 1]
(./Images/1.png)

blablalbalblbl

blabllablb
>```python
HAV - José Martí International Airport
HKG - Hong Kong International Airport
LAX - Los Angeles
YYZ - Toronto Pearson International Airport
>```

We concatenated the airport codes together to create the passphrase ```HAVHKGLAXYYZ```

>```dos
c:\steghide-0.5.1-win32\steghide>steghide.exe --info steghide.jpg
"steghide.jpg":
  format: jpeg
  capacity: 167.0 Byte
Try to get information about embedded data ? (y/n) y
Enter passphrase:HAVHKGLAXYYZ
  embedded file "key.txt":
    size: 13.0 Byte
    encrypted: rijndael-128, cbc
    compressed: yes
>```

>```
c:\steghide-0.5.1-win32\steghide>steghide.exe extract -sf steghide.jpg
Enter passphrase:HAVHKGLAXYYZ
wrote extracted data to "key.txt".
>```

Looking into the extracted key.txt file we get the flag ```iH4t3A1rp0rt5```
