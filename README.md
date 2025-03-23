# BACKUP YOUR PIP-BOY SD CARD BEFORE USING THIS.
Repo containing my custom applications for the PipBoy 3000 MkVI prop from The Wand Company.
To use, download the repository and move the USER and APPINFO folders into your PipBoy SD Card. 
For more information on how to access the SD card, see my [blog on the subject](https://athene.gay/projects/pipboy.html) and [RobCo's blogposts](https://log.robco-industries.org/documentation/pipboy-3000/#main-menu).

You can customise the points in a skill for yourself by changing the 'points' value in the relevant skill's JSON.

Adding your own Skills, Perks or Skills is easy - just copy one of the existing files in the relevant folder, edit it to your liking, and update the 'img', xSize and ySize values with an image generated by [this tool](https://www.espruino.com/Image+Converter). Make sure to select the "Use Compression?", "Transparency?" and "Crop?" options, then select "Output As: Image Object" and copy the value in the quotes inside the 'atob' function over to the 'img' attribute in your new file. Set xSize to the 'width' and ySize to the 'height' from the image object.
