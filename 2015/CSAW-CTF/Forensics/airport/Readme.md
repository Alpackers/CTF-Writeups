#Airport

**Category:** Forensics
**Points:** 200
**Description:** NA

[airport_26321e6eac7a7490e527cbe27ceb68c1.zip](airport_26321e6eac7a7490e527cbe27ceb68c1.zip)

##Write-up
 We get our first clue from hitting the link in the description and retrieving the zip file.  This file contains four .png and one .jpg file.  The four png images are aerial views of various unknown airfields.  The jpg image is a banner of the popular Steganography program called Steghide.  After reviewing the Steghide documentation, it's clear the program only supports JPEG, BMP, WAV and AU files.  This was the first clue that the hidden data was in the only jpg file contained in the zip file.

The next step was to determine what airfields were depicted in four png images.  Each airfield image contained at least one highway/road number in the embedded on the photo.  This led to google searches in an attempt to identify all four airfields.  e.g., airport highway 1 revealed Los Angeles International Airport (LAX) for image 3.png.

![Image of 3]
(./Images/3.png)

The hardest part of solving this challenge was 1.png.  The airfield in questions indicates yellow road numbers.  After massive google searches it was determined many European countries use these colors. However, no results were identified.  Further review of the image showed a baseball diamond at the top of the image indicating that the airfield was likely not in Europe.  Other countries that use the same color signs finally revealed Cuba (José Martí International Airport) as the answer.


![Image of 1]
(./Images/1.png)

Also identifed were Hong Kong International Airport
![Image of 2]
(./Images/2.png)

And Toronto Pearson International Airport
![Image of 4]
(./Images/4.png)

After all four airfields were identifed it was just a matter of determinig their three letter international identifier.

>```python
HAV - José Martí International Airport
HKG - Hong Kong International Airport
LAX - Los Angeles International Airport
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
