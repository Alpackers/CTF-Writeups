#Crack Me If You Can

**Category:** Reversing
**Points:** 100
**Description:**

> John bets nobody can find the passphrase to login!

> GPG key: viphHowrirOmbugTudIbavMeuhacyet

##Write-up
> To start, we are given an apk to reverse.  The firt thing I did was attempt to decompile the code.  To do this I used a few different tools.  The first thing we need to do is unzip the apk into a dex file.  After that we can use dex2jar to convert this into a jar file.  Finally, we can use luyten to open the jar and inspect the code.

>```bash
>$ unzip crack-me-if-you-can.apk classes.dex
> Archive: crack-me-if-you-can.apk
>  inflating: classes.dex
>$ ~/dex2jar-0.0.9.15/dex2jar.sh classes.dex
> this cmd is deprecated, use the d2j-dex2jar if possible
> dex2jar version: translator-0.0.9.15
> dex2jar classes.dex -> classes_dex2jar.jar
> Done.
>$ java -jar ~/luyten-0.4.3/luyten-0.4.3.jar classes_dex2jar.jar
>```
>
![Image of luyten]
(./luyten.tiff)
>
> The first thing I noticed in the it.polictf2015 package was the string
>
>```
> flagging{It_cannot_be_easier_than_this}
>```
>
> I tried this with the correct flag{.*} format but it didn't work.  After looking through the layers of classes, all of which had a.b, b.c, b.d, c.a style structures I landed on the following chunk of java.
>
>```java
>private boolean a(final String s) {
>        if (s.equals(c.a(it.polictf2015.b.a(it.polictf2015.b.b(it.polictf2015.b.c(it.polictf2015.b.d(it.polictf2015.b.g(it.polictf2015.b.h(it.polictf2015.b.e(it.polictf2015.b.f(it.polictf2015.b.i(c.c(c.b(c.d(this.getString(2131492920)))))))))))))))) {
>            Toast.makeText(this.getApplicationContext(), (CharSequence)this.getString(2131492924), 1).show();
>            return true;
>        }
>        return false;
>    }
>```
> This looks promising, but we need to find out what the following string is.
>```java
> this.getString(2131492920)
>```
> 
> Already having the android-sdk installed, I went into the build-tools directory and grepped the output from aapt looking for the hex representation of the string reference.
>
>```bash
>$ ./aapt d --values resources ~/Dropbox/crack-me-if-you-can.apk | grep 0x7f0c0038
>      spec resource 0x7f0c0038 it.polictf2015:string/àè: flags=0x00000000
>        resource 0x7f0c0038 it.polictf2015:string/àè: t=0x03 d=0x0000017b (s=0x0008 r=0x00)
>```
>
> We can see that we got a hit on the it.polictf2015:string/àè string.  Now to get the strings.xml file.  For this, we'll use apktool to open up the apk.
>
>```bash
>$ java -jar apktool_2.0.0.jar d ~/Dropbox/crack-me-if-you-can.apk 
>I: Using Apktool 2.0.0 on crack-me-if-you-can.apk
>I: Loading resource table...
>I: Decoding AndroidManifest.xml with resources...
>I: Loading resource table from file: /Users/haylesr/Library/apktool/framework/1.apk
>I: Regular manifest package...
>I: Decoding file-resources...
>I: Decoding values */* XMLs...
>I: Baksmaling classes.dex...
>I: Copying assets and libs...
>I: Copying unknown files...
>I: Copying original files...
>```
>
> In the res/values directory we find strings.xml.  Below is a snippet with the important stuff.
>
>```xml
><?xml version="1.0" encoding="utf-8"?>
><resources>
>    <string name="prompt">Crack me!</string>
>    <string name="store_picture_message">Allow Ad to store image in Picture gallery?</string>
>    <string name="store_picture_title">Save image</string>
>    <string name="wallet_buy_button_place_holder">Buy with Google</string>
>    <string name="à">Incorrect!</string>
>    <string name="àè" formatted="false">[[c%l][c{g}[%{%Mc%spdgj=]T%aat%=O%bRu%sc]c%ti[o%n=Wcs%=No[t=T][hct%=buga[d=As%=W]e=T%ho[u%[%g]h%t[%}%</string>
>    <string name="àò" formatted="false">[[c%l][c{g}[%{%Mc%spdggfdj=]T%aat%=O%bRu%sc]c%ti[o[t=T][hct%=budsga[d=As%=W]e=T%ho[u%[%g]h%t[%}%T[]e3</string>
>    <string name="àù">Your device looks good :)</string>
>    <string name="è">Empty!</string>
>    <string name="ìò">Good to go! =)</string>
>    <string name="ù">"Nice emulator, I'm watching you ;)"</string>
>    <string name="ùò">Hello!</string>
></resources>
>```
>
> We see our string reference matches up and we are left with the following:
>
>```
> [[c%l][c{g}[%{%Mc%spdggfdj=]T%aat%=O%bRu%sc]c%ti[o[t=T][hct%=budsga[d=As%=W]e=T%ho[u%[%g]h%t[%}%T[]e3
>```
>
> I turned to python to recreate the b.java and c.java that we were able to see using the luyten tool.  These classes basically just did a bunch of replacements on a given String value.

>```python
>def ca(text):
>	return text.replace("aa","ca")
>def cb(text):
>	return text.replace("aat","his")
>def cc(text):
>	return text.replace("buga","Goo")
>def cd(text):
>	return text.replace("spdgj","yb%e")
>def ba(text):
>	return text.replace("c","a")
>def bb(text):
>	return text.replace("%","")
>def bc(text):
>	return text.replace("[","")
>def bd(text):
>	return text.replace("]","")
>def be(text):
>	return text.replace("\\{","")
>def bf(text):
>	return text.replace("\\}","")
>def bg(text):
>	return text.replace("c","f")
>def bh(text):
>	return text.replace("R","f")
>def bi(text):
>	return text.replace("=","_")
>
>flag="[[c%l][c{g}[%{%Mc%spdgj=]T%aat%=O%bRu%sc]c%ti[o%n=Wcs%=No[t=T][hct%=buga[d=As%=W]e=T%ho[u%[%g]h%t[%}%"
>print ca(ba(bb(bc(bd(bg(bh(be(bf(bi(cc(cb(cd(flag)))))))))))))
>```
>
> Running this code produced the following:
>
>```bash
>$ python ~/Dropbox/crackme.py 
> flf{g}{Mfybe_This_Obfusfftion_Wfs_Not_Thft_Good_As_We_Thought}
>```
>
> Bravo! We got the flag, but with some obvious mistakes. I'm sure I screwed up my python somewhere, but the flag is close enough that we can translate it to the correct value.  I never went back to find the mistake.  We submitted the flag and moved on.
>
>```bash
> flag{Maybe_This_Obfuscation_Was_Not_That_Good_As_We_Thought}
>```
