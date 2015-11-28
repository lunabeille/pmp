# pmp
poupinou master project - tetris game
================

PMP, standing for Poupinou Master Project, is the name of the project i've decided to achive for my project managing class.
We are going to try and create a new Tetris game, where cute sheep (poupinous actually) will replace the usual Tetris bricks. Made of modelling clay, with square bodies and head (to make it easier to code afterwards), they'll have different postures in order to simulate the different tetris shapes.

Using the stop-motion animation technique, we'll include the images created from pictures to our code file.
The purpose, apart from achieving a funky crazy cool game, is to follow a global project managing plan, using techniques and tools introduced during the class.
We are planning to finish this project by the end of january.

Now, let's have some fun !
Poupi poweeeer ina action, yo !


How to run pmp
---------

Currently, the project only provides a quite poor raw interface (called "text", even if it is based on HTML), based on a pre element. Advanced interface will come soon, but our tetris game is currently playable if you really want to...

requirements :
  * make
  * bower (sudo apt-get install nodejs npm && sudo npm install -g bower)

To get pmp working on your side, you need to clone the project :
<pre>
git clone https://github.com/lunabeille/pmp.git ./pmp
</pre>

Then, open the project directory, and type "make". It must download external javascripts libraries (at the moment, we use requirejs and jquery) with bower, in a "bower_components" directory, at project root. Then, simply open src/text.html with your internet browser. Only Firefox and Chromium have been currently tested, Opera and Safari probably work... IE is not supported for now.

Have fun !
