#des ofb

**Category:** Crypto
**Points:** 2
**Description:**

Decrypt the message, find the flag, and then marvel at how broken everything is.

##Write-up
To start we are provided with two items, a copy of the ciphertext and the following python script.

```python
from Crypto.Cipher import DES

f = open('key.txt', 'r')
key_hex = f.readline()[:-1] # discard newline
f.close()
KEY = key_hex.decode("hex")
IV = '13245678'
a = DES.new(KEY, DES.MODE_OFB, IV)

f = open('plaintext', 'r')
plaintext = f.read()
f.close()

ciphertext = a.encrypt(plaintext)
f = open('ciphertext', 'w')
f.write(ciphertext)
f.close()
```

A quick glance at the code (and the challenge title) tells us that we're dealing with Data Encryption Standard (DES) utilizing Output Feedback (OFB) mode.  We can also see in the code that we already have the Initialization Vector (IV) used for encryption ```IV = '13245678'```.  A quick refresher on OFB shows that the decryption process envolves the ```IV``` and ```key``` being encrypted and then XORed with the ```ciphertext``` to return our ```plaintext```.

![Image of OFB]
(./Images/601px-OFB_decryption.png)

I know it's obvious, but for the sake of trying to write a thorough write-up I'll say it.  Since we know the ```IV``` and ```ciphertext``` already, the last piece that we need to decrypt the message is the ```key``` itself.  My first thought was just to try and bruteforce the key outright with the following script.

```python
from Crypto.Cipher import DES

def is_ascii(s):
    return all(ord(c) < 128 for c in s)
def ByteToHex( byteStr ):
    return ''.join( [ "%02X" % ord( x ) for x in byteStr ] ).strip()

f = open('c.txt', 'r')
ciphertext = f.read()
f.close()
i=0
IV = '13245678'
bites = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\x09', '\x0A', '\x0B', '\x0C', '\x0D', '\x0E', '\x0F', '\x10', '\x11', '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1A', '\x1B', '\x1C', '\x1D', '\x1E', '\x1F', '\x20', '\x21', '\x22', '\x23', '\x24', '\x25', '\x26', '\x27', '\x28', '\x29', '\x2A', '\x2B', '\x2C', '\x2D', '\x2E', '\x2F', '\x30', '\x31', '\x32', '\x33', '\x34', '\x35', '\x36', '\x37', '\x38', '\x39', '\x3A', '\x3B', '\x3C', '\x3D', '\x3E', '\x3F', '\x40', '\x41', '\x42', '\x43', '\x44', '\x45', '\x46', '\x47', '\x48', '\x49', '\x4A', '\x4B', '\x4C', '\x4D', '\x4E', '\x4F', '\x50', '\x51', '\x52', '\x53', '\x54', '\x55', '\x56', '\x57', '\x58', '\x59', '\x5A', '\x5B', '\x5C', '\x5D', '\x5E', '\x5F', '\x60', '\x61', '\x62', '\x63', '\x64', '\x65', '\x66', '\x67', '\x68', '\x69', '\x6A', '\x6B', '\x6C', '\x6D', '\x6E', '\x6F', '\x70', '\x71', '\x72', '\x73', '\x74', '\x75', '\x76', '\x77', '\x78', '\x79', '\x7A', '\x7B', '\x7C', '\x7D', '\x7E', '\x7F', '\x80', '\x81', '\x82', '\x83', '\x84', '\x85', '\x86', '\x87', '\x88', '\x89', '\x8A', '\x8B', '\x8C', '\x8D', '\x8E', '\x8F', '\x90', '\x91', '\x92', '\x93', '\x94', '\x95', '\x96', '\x97', '\x98', '\x99', '\x9A', '\x9B', '\x9C', '\x9D', '\x9E', '\x9F', '\xA0', '\xA1', '\xA2', '\xA3', '\xA4', '\xA5', '\xA6', '\xA7', '\xA8', '\xA9', '\xAA', '\xAB', '\xAC', '\xAD', '\xAE', '\xAF', '\xB0', '\xB1', '\xB2', '\xB3', '\xB4', '\xB5', '\xB6', '\xB7', '\xB8', '\xB9', '\xBA', '\xBB', '\xBC', '\xBD', '\xBE', '\xBF', '\xC0', '\xC1', '\xC2', '\xC3', '\xC4', '\xC5', '\xC6', '\xC7', '\xC8', '\xC9', '\xCA', '\xCB', '\xCC', '\xCD', '\xCE', '\xCF', '\xD0', '\xD1', '\xD2', '\xD3', '\xD4', '\xD5', '\xD6', '\xD7', '\xD8', '\xD9', '\xDA', '\xDB', '\xDC', '\xDD', '\xDE', '\xDF', '\xE0', '\xE1', '\xE2', '\xE3', '\xE4', '\xE5', '\xE6', '\xE7', '\xE8', '\xE9', '\xEA', '\xEB', '\xEC', '\xED', '\xEE', '\xEF', '\xF0', '\xF1', '\xF2', '\xF3', '\xF4', '\xF5', '\xF6', '\xF7', '\xF8', '\xF9', '\xFA', '\xFB', '\xFC', '\xFD', '\xFE']
for bite1 in bites:
  for bite2 in bites:
    for bite3 in bites:
      for bite4 in bites:
        for bite5 in bites:
          for bite6 in bites:
            for bite7 in bites:
              for bite8 in bites:
                KEY=b''.join([bite1,bite2,bite3,bite4,bite5,bite6,bite7,bite8])
                a = DES.new(KEY, DES.MODE_OFB, IV)
                plaintext = a.decrypt(ciphertext)
                if is_ascii(plaintext):
                  print ByteToHex(KEY)+":"+plaintext
```

I should have realized just from the keyspace, but after a few minutes of bruteforcing it was obvious that this was not going to finish during the CTF, current month, or possibly the current year.  I took a step back and looked a little deeper into DES and OFB together.  I quickly came across an [article](http://crypto.stackexchange.com/questions/7938/may-the-problem-with-des-using-ofb-mode-be-generalized-for-all-feistel-ciphers) on ```crypto.stackexchange.com``` that proved to be very helpful.  From the exchange of information there are a few key (no pun intended) pieces of information here.  Namely the following:

>That is correct as that is the definition of a DES weak key, a key for which encryption and decryption have the same effect.

and

>The output of every other blockcipher call would be the original IV which is assumed to be public knowledge, so the attacker can decrypt every other block w/o knowing the key. Further more the odd numbered blocks (if we start our numbering with 1) will all be encrypted with the same keystream. So that is a weakness in and of itself. But, even more so, since there are only 4 weak keys, the attacker can surely figure out the odd numbered blocks too (once he knows a weak key was used).

This sounded perfect, but I didn't exactly know what the definition of a weak key was.  With a little more help from Google I found an [article](https://en.wikipedia.org/wiki/Weak_key) that directly called out weak keys for DES.  In it we find the following 4 weak keys:

```
0x0000000000000000
0xFFFFFFFFFFFFFFFF
0xE1E1E1E1F0F0F0F0
0x1E1E1E1E0F0F0F0F
```

Using this information I went back and edited my initial brute force script to only use the following keys.

```python
from Crypto.Cipher import DES

f = open('ciphertext', 'r')
ciphertext = f.read()
f.close()
IV = '13245678'
KEY=b'\x00\x00\x00\x00\x00\x00\x00\x00'
a = DES.new(KEY, DES.MODE_OFB, IV)
plaintext = a.decrypt(ciphertext)
print plaintext

KEY=b'\x1E\x1E\x1E\x1E\x0F\x0F\x0F\x0F'
a = DES.new(KEY, DES.MODE_OFB, IV)
plaintext = a.decrypt(ciphertext)
print plaintext

KEY="\xE1\xE1\xE1\xE1\xF0\xF0\xF0\xF0"
a = DES.new(KEY, DES.MODE_OFB, IV)
plaintext = a.decrypt(ciphertext)
print plaintext

KEY="\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF"
a = DES.new(KEY, DES.MODE_OFB, IV)
plaintext = a.decrypt(ciphertext)
print plaintext
```

From the output we find the the decrypted plaintext.

```
To be, or not to be, that is the question:
Whether 'tis Nobler in the mind to suffer
The Slings and Arrows of outrageous Fortune,
Or to take Arms against a Sea of troubles,
And by opposing end them: to die, to sleep
No more; and by a sleep, to say we end
The Heart-ache, and the thousand Natural shocks
That Flesh is heir to? 'Tis a consummation
Devoutly to be wished. To die, to sleep,
To sleep, perchance to Dream; aye, there's the rub,
For in that sleep of death, what dreams may come,
When we have shuffled off this mortal coil,
Must give us pause. There's the respect
That makes Calamity of so long life:
For who would bear the Whips and Scorns of time,
The Oppressor's wrong, the proud man's Contumely,
The pangs of despised Love, the Law’s delay,
The insolence of Office, and the Spurns
That patient merit of the unworthy takes,
When he himself might his Quietus make
With a bare Bodkin? Who would Fardels bear,
To grunt and sweat under a weary life,
But that the dread of something after death,
The undiscovered Country, from whose bourn
No Traveller returns, Puzzles the will,
And makes us rather bear those ills we have,
Than fly to others that we know not of.
Thus Conscience does make Cowards of us all,
And thus the Native hue of Resolution
Is sicklied o'er, with the pale cast of Thought,
And enterprises of great pitch and moment,
With this regard their Currents turn awry,
And lose the name of Action. Soft you now,
The fair Ophelia? Nymph, in thy Orisons
Be all my sins remembered. BKPCTF{so_its_just_a_short_repeating_otp!}
```

We did recover the flag ```BKPCTF{so_its_just_a_short_repeating_otp!}```, but we should hold true to the description and marvel at how broken everything is.  To that effect, I've included the output of one of the incorrect weak keys.  It's amazing how much you can see without actually having the correct decryption key.

```
g?䲕??or not to??????at is the??????on:
WhethV?????? Nobler i]స???ind to suU??????e Slings R?????ows of ouG??????s Fortuneʋ???? take Arm@ॷ???st a Sea \?䤂??bles,
And?????osing end??????to die, t\෼???
No more;?????? a sleep,?????? we end
T[?䘕??t-ache, a]?䤘?thousand }?????? shocks
T[?????sh is heiAిϤ?Tis a con@??????on
Devout_?䤟??e wished.?????, to sleeC?΄???leep, perP?????to Dream;???ܤ?here's thVඥ???For in thR?䣜??p of deat[?䧘?? dreams mR?䳟??,
When we??????huffled oU?䤘?? mortal c\??????st give u@റ???. There's??????spect
ThaGੱ??? Calamity?????long life	ʂ????ho would Q??????e Whips a]?䃓??ns of timV?΄??Oppressor?䧂??g, the pr\?????'s ContumV??????e pangs oU࠵???sed Love,??????w’s delR??ڤ?? insolencV૶???fice, and??????urns
That??????t merit oUస???nworthy tR???܎?hen he hi^??????ight his b?????? make
Wit[????e Bodkin???????uld Farde_?䲕??,
To grunGॾ???weat undeA?????ry life,
q??????t the dreR?俖??omething R??????eath,
The??????overed CoF??????from whosVি???
No Trave_??????turns, PuI??????he will,
r?????es us rat[?????r those i_?????have,
Tha]ࢼ???o others G?????? know not??????us ConsciV??????es make C\??????of us allʅ????hus the NR??????ue of Res\??????
Is sicklZ????r, with t[?䠑?? cast of g??????,
And entV??????s of greaGഹ??? and mome]??ڧ??h this reT??????eir Curre]??????n awry,
A]?伟?? the name?????ion. Soft??????w,
The faZ?䟀??lia? Nymp[?乞??hy Orison@ʆ????l my sins??????ered. BKPp??????its_just_R??????_repeatinT??????
```
