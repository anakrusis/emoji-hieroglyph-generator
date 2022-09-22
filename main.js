TEXT_COLUMNS = 15;
SPACES_DRAWN = true;
CHAR_DIM = 72;
CHAR_PADDING = 4;

function setup(){
	document.getElementById("btn").onclick = function(){
		SPACES_DRAWN = document.getElementById("spacecb").checked;
		var text = document.getElementById("textarea").value;
		transcribeText(text);
	}
}

function preload(){
	var dict = document.getElementById("dictionary")
	
	for (key in GLYPHS) {
		var names = "[" + key + "], "
		glyph = GLYPHS[key];
		// loads image associated with glyph's name
		glyph.img = loadImage("emoji/" + key + ".png");
		
		if (key == "NO_EMOJI"){ continue; }
		
		// maps all aliases to the same pointer as the glyph itself
		if (glyph.aliases){
			for (var i = 0; i < glyph.aliases.length; i++){
				var ca = glyph.aliases[i];
				GLYPHS[ca] = glyph;
				
				var aliasstring = ca;
				if (aliasstring.length > 1){
					aliasstring = "[" + aliasstring + "]";
				}
				
				names += aliasstring + ", ";
			}
		}
		// gets rid of the extra comma and space at the end
		names = names.slice(0, -2)
		
		// generates a dictionary entry for every emoji
		var newrow = dict.insertRow();
		var namecell = newrow.insertCell();
		namecell.innerHTML = names;
		
		var imgcell = newrow.insertCell();
		imgcell.innerHTML = "<img src='emoji/" + key + ".png'>"
		
		var usecell = newrow.insertCell();
		if (glyph.use){
			usecell.innerHTML = glyph.use
		}
	}
	
	
	
/* 		// phonetic glyphs first
		"'":   loadImage("emoji/eye.png"),
		"b":   loadImage("emoji/bee.png"),
		"bl":  loadImage("emoji/bell.png"),
		"ch":  loadImage("emoji/hatching_chick.png"),
		"d":   loadImage("emoji/door.png"),
		"f":   loadImage("emoji/fire.png"),
		"g":   loadImage("emoji/gear.png"),
		"h":   loadImage("emoji/rabbit.png"),
		"j":   loadImage("emoji/jar.png"),
		"k":   loadImage("emoji/key.png"),
		"kl":  loadImage("emoji/red_car.png"),
		"kr":  loadImage("emoji/call_me.png"),
		"l":   loadImage("emoji/leaves.png"),
		"m":   loadImage("emoji/house.png"),
		"n":   loadImage("emoji/leg.png"),
		"nd":  loadImage("emoji/raised_hand.png"),
		"ng":  loadImage("emoji/horse.png"),
		"ns":  loadImage("emoji/sauropod.png"),
		"nt":  loadImage("emoji/knot.png"),
		"p":   loadImage("emoji/feet.png"),
		"pl":  loadImage("emoji/person_swimming.png"),
		"pr":  loadImage("emoji/pear.png"),
		"r":   loadImage("emoji/ear.png"),
		"s":   loadImage("emoji/ice_cube.png"),
		"sb":  loadImage("emoji/spoon.png"),
		"sd":  loadImage("emoji/star.png"),
		"sg":  loadImage("emoji/socks.png"),
		"sh":  loadImage("emoji/athletic_shoe.png"),
		"shn": loadImage("emoji/sparkles.png"),
		"shp": loadImage("emoji/sailboat.png"),
		"t":   loadImage("emoji/tea.png"),
		"T":   loadImage("emoji/coffee.png"),
		"th":  loadImage("emoji/thread.png"),
		"tr":  loadImage("emoji/tree.png"),
		"v":   loadImage("emoji/ocean.png"),
		"w":   loadImage("emoji/whale.png"),
		"y":   loadImage("emoji/sweet_potato.png"),
		"z":   loadImage("emoji/cloud.png"),
		
		// logograms next...
		// (I'll just add them as they are needed)
		"point_up": 		loadImage("emoji/point_up.png"),
		"point_down": 		loadImage("emoji/point_down.png"),
		"point_left": 		loadImage("emoji/point_left.png"),
		"point_right": 		loadImage("emoji/point_right.png"),
		"point_up_2":		loadImage("emoji/point_up_2.png"),
		"wave": 			loadImage("emoji/wave.png"),
		"inbox_tray":		loadImage("emoji/inbox_tray.png"),
		"outbox_tray":		loadImage("emoji/outbox_tray.png"),
		"koko":				loadImage("emoji/koko.png"),
		"clock":			loadImage("emoji/clock.png"),
		"left_right_arrow":	loadImage("emoji/left_right_arrow.png"),
		"question":			loadImage("emoji/question.png"),
		"grey_question":	loadImage("emoji/grey_question.png"),
		"no_entry_sign":	loadImage("emoji/no_entry_sign.png"),
		
		"test_tube":		loadImage("emoji/test_tube.png"),
		"bulb":				loadImage("emoji/bulb.png"),
		"book":				loadImage("emoji/book.png"),
		"writing_hand":		loadImage("emoji/writing_hand.png"),
		"hammer": 			loadImage("emoji/hammer.png"),
		"wrench": 			loadImage("emoji/wrench.png"),
		"tools": 			loadImage("emoji/tools.png"),
		"floppy_disk": 		loadImage("emoji/floppy_disk.png"),
		"handshake": 		loadImage("emoji/handshake.png"),
		
		"computer":			loadImage("emoji/computer.png"),
		"robot":			loadImage("emoji/robot.png"),
		"scroll":			loadImage("emoji/scroll.png"),
		"family":			loadImage("emoji/family.png"),
		
		"seedling":			loadImage("emoji/seedling.png"),
		"checkered_flag": 	loadImage("emoji/checkered_flag.png"),
		
		"ERROR":  loadImage("emoji/NO_EMOJI.png"),
	} */
}

function draw(){
	
}

function transcribeText(text){
	
	var textlist = [];
	var inbracket = false;
	var currentgrouping = "";
	
	// first we will just seperate the characters in brackets into a 1-dimensional list
	for (var i = 0; i < text.length; i++){
		var cchar = text.charAt(i);
		if (cchar == "["){
			inbracket = true; continue;
		}
		if (cchar == "]"){
			inbracket = false; 
			textlist.push( currentgrouping ); 
			currentgrouping = ""; continue;
		}
		
		if (inbracket){
			currentgrouping += cchar;
		}else{
			textlist.push(cchar);
		}
	}
	// with no spaces, the whole document will be one big word
	if (!SPACES_DRAWN){
		for (var i = textlist.length - 1; i >= 0; i--){
			if (textlist[i] == " "){
				textlist.splice(i, 1);
			}
		}
	}
	
	// Its janky but this just add a space to the end so the last (or only) word is seen as a word
	textlist.push(" ");
	
	// to word wrap, we will see if the current space character is on the same row as the last one
	// if they are on different rows, then we know that the word has spilled into the next row.
	
	var currspaceind = 0;
	var lastspaceind = 0;
	var currword = [];
	
	var i = 0;
	while (i < textlist.length){
		var cchar = textlist[i];
		if (cchar == " "){
			lastspaceind = currspaceind;
			currspaceind = i;
			
			lastspacerow = Math.floor(lastspaceind / TEXT_COLUMNS );
			currspacerow = Math.floor(currspaceind / TEXT_COLUMNS );
			
			if (lastspacerow != currspacerow){
				
				console.log("lsi: " + lastspaceind + " csi: " + currspaceind);
				console.log(currword)
				
				// If a word is longer than the max number of columns, 
				// then there isn't anything we can do to make it fit
				
				// otherwise, to make words appear on the next line, we give them
				// the complement number of the columns count.
				if (currword.length <= TEXT_COLUMNS ){
					var blanks_to_insert = TEXT_COLUMNS - (lastspaceind % TEXT_COLUMNS) - 1;
					console.log("bti: " + blanks_to_insert);
					for (var q = 0; q < blanks_to_insert; q++){
						textlist.splice(lastspaceind, 0, " ");
						i++;
						currspaceind++;
					}
				}
			}
			currword = [];
			
		}else if (cchar == "\n"){
			textlist.splice(i,1);
			var blanks_to_insert = TEXT_COLUMNS - (i % TEXT_COLUMNS);
			for (var q = 0; q < blanks_to_insert; q++){
				textlist.splice(i, 0, " ");
				i++;
			}
			currword = [];
			currspaceind = i;
			
		}else{
			currword.push(cchar);
		}
		i++;
	}
	// removes the extra space character we added earlier
	textlist.pop();
	
	var rows = 1 + Math.floor( textlist.length / TEXT_COLUMNS );
	
	var canvaswidth = CHAR_PADDING + (TEXT_COLUMNS * (CHAR_DIM + CHAR_PADDING))
	var canvasheight = CHAR_PADDING + (rows * (CHAR_DIM + CHAR_PADDING))
	resizeCanvas( canvaswidth, canvasheight );
	clear();
	
	for (var i = 0; i < textlist.length; i++){
		var x = ( i % TEXT_COLUMNS );
		var y = Math.floor( i / TEXT_COLUMNS );
		drawGlyph(textlist[i], x, y);
	}
}

function drawGlyph(glyphname, column, row){
	if (glyphname == " "){ return }
	var img = GLYPHS[glyphname] ? GLYPHS[glyphname].img : GLYPHS["NO_EMOJI"].img;
	var x = CHAR_PADDING + ( column * ( CHAR_DIM + CHAR_PADDING ) );
	var y = CHAR_PADDING + ( row * (CHAR_DIM + CHAR_PADDING ))
	image(img,x,y,CHAR_DIM,CHAR_DIM);
}