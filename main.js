TEXT_COLUMNS = 32;
SPACES_DRAWN = true;
BACKGROUND_COLOR = "";
CHAR_DIM = 48;
CHAR_PADDING = 4;

COLORS = {
	"transparent":	[255,255,255,0],
	"white":		[255,255,255],
	"blurple":		[54,57,63]
}

function setup(){	
	document.getElementById("btn").onclick = function(){
		SPACES_DRAWN = document.getElementById("spacecb").checked;
		
		var colornames = ["transparent", "blurple", "white"];
		BACKGROUND_COLOR = colornames[document.getElementById("bgcolor").selectedIndex];
		
		var colnum = document.getElementById("colnum").value;
		colnum = Math.max( colnum, 1 ); colnum = Math.min( colnum, 128 );
		document.getElementById("colnum").value = colnum;
		TEXT_COLUMNS = colnum;
		
		var csn = document.getElementById("charsizenum").value;
		csn = Math.max( csn, 8 ); csn = Math.min( csn, 128 );
		document.getElementById("charsizenum").value = csn;
		CHAR_DIM = csn;
		
		textAlign(LEFT, TOP)
		textSize(CHAR_DIM);
		var textcolor = BACKGROUND_COLOR == "white" ? 0 : 255;
		fill(textcolor)
		
		var text = document.getElementById("textarea").value;
		transcribeText(text);
	}
}

function preload(){
	for (key in GLYPHS) {
		var names = "[" + key + "], "
		glyph = GLYPHS[key];
		// the primary name, used to get the image for this glyph
		glyph.imgname = key;
		
		// this ones special, it wont ever be loaded if we dont do it now
		if (key == "NO_EMOJI"){ 
			glyph.img = loadImage("emoji/NO_EMOJI.png");
			continue; 
		}
		
		if (!glyph.aliases){
			glyph.aliases = [];
		}
		// the emoji string itself also points to the dictionary item
		if (glyph.emoji){
			glyph.aliases.push( glyph.emoji );
		}
		
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
	}
}

function draw(){
	
}

function transcribeText(text){
	
	var textlist = [];
	var inbracket = false;
	var currentgrouping = "";
	
	// first we will just seperate the characters in brackets into a 1-dimensional list
	var textlength = Array.from(text).length;
	for (var i = 0; i < textlength; i++){
		var cchar = Array.from(text)[i];
		
		// variation selector is always ignored. of course we want emoji presentation!
		if (cchar.charCodeAt(0) == 65039){
			continue;
		}
		if (cchar == "["){
			inbracket = true; continue;
		}
		if (cchar == "]"){
			inbracket = false; 
			textlist.push( currentgrouping ); 
			currentgrouping = ""; continue;
		}
		
		// fullwidth spaces and interpuncts are internally converted to ascii spaces
		// (which can be converted back lol)
		if (cchar == "　" || cchar == "▪"){
			cchar = " ";
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
	
	// all characters that are not associated with an emoji are converted to fullwidth		
	for (var i = 0; i < textlist.length; i++){
		var cword = textlist[i];
		if (GLYPHS[cword]){ continue; }
		
		var shiftCharCode = Δ => c => String.fromCharCode(c.charCodeAt(0) + Δ);
		var toFullWidth = str => str.replace(/[!-~]/g, shiftCharCode(0xFEE0));
		var toHalfWidth = str => str.replace(/[！-～]/g, shiftCharCode(-0xFEE0));
		
		textlist[i] = toFullWidth(cword);
	}
	
	// Its janky but this just add a space to the end so the last (or only) word is seen as a word
	textlist.push(" ");
	
	//print(textlist)
	
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
			lastspacecol = lastspaceind % TEXT_COLUMNS;
			currspacecol = currspaceind % TEXT_COLUMNS;
			
			if (lastspacerow != currspacerow){
				
				console.log("lsi: " + lastspaceind + " csi: " + currspaceind);
				console.log(currword)
				
				// If a word is longer than the max number of columns, 
				// then there isn't anything we can do to make it fit
				
				// otherwise, to make words appear on the next line, we give them
				// the complement number of the columns count.
				if (currword.length <= TEXT_COLUMNS && lastspacecol != 0 && currspacecol != 0 ){					
					var blanks_to_insert = TEXT_COLUMNS - (lastspaceind % TEXT_COLUMNS) - 1;
					console.log("bti: " + blanks_to_insert);
					for (var q = 0; q < blanks_to_insert; q++){
						textlist.splice(lastspaceind, 0, " ");
						i++;
						currspaceind++;
					}
				}
			}
			// if a space occurs directly on the line break (that is, column 0) then its not needed
			currspacecol = currspaceind % TEXT_COLUMNS;
			if (currspacecol == 0){
				console.log("removing space at " + currspaceind + " csc: " + currspacecol);
				textlist.splice(currspaceind, 1)
				i--;
			}
		
			currword = [];
			
		// Todo make this fully functional
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
	// removes the extra space character we added earlier, if still present
	if (textlist[ textlist.length - 1 ] == " "){
		textlist.pop();
	}
	
	// we count how many glyph images need to be loaded that aren't already
	imagesfinished = 0;
	imagesqueued   = 0;
	// the names of the images that are queued to load stored temporarily here.
	// this way the same image isn't expected to load twice
	var imagenamestoload = [];
	for (var i = 0; i < textlist.length; i++){
		var glyphname = textlist[i];
		// if no emoji exists then ofc no image to load either
		if (!GLYPHS[glyphname]){ continue; }
		var cg = GLYPHS[glyphname];
		
		if (!cg.img && imagenamestoload.indexOf(cg.imgname) == -1){
			imagenamestoload.push(cg.imgname);
			imagesqueued++;
		}
	}
	print("images queued: " + imagesqueued);
	// now we iterate again and this time we load the images
	// If this was in the above for loop, there would be a chance that images would load before
	// the count of total queued images has finished counting, which could cause it to exit prematurely
	for (var i = 0; i < textlist.length; i++){
		var currentglyph = GLYPHS[textlist[i]];
		if (!currentglyph){ continue; }
		if (!currentglyph.img){
			
			// upon the image finishing loading, we see how many more are left to go
			// if no more images are left to load, then draw the final image
			currentglyph.img = loadImage("emoji/" + currentglyph.imgname + ".png", img => {
				imagesfinished++;
				if (imagesfinished / imagesqueued == 1){
					console.log("images queued at the time of render: " + imagesqueued);
					drawGlyphsAndPutText(textlist);
					return;
				}
			});
		}
	}
	// were there never any images to load to begin with? no need to wait then
	if (imagesqueued == 0){
		drawGlyphsAndPutText(textlist);
	}
}

function drawGlyphsAndPutText(textlist){
	
	var rows = 1 + Math.floor( (textlist.length - 1) / TEXT_COLUMNS );
	
	var canvaswidth = CHAR_PADDING + (TEXT_COLUMNS * (CHAR_DIM + CHAR_PADDING))
	var canvasheight = CHAR_PADDING + (rows * (CHAR_DIM + CHAR_PADDING))
	resizeCanvas( canvaswidth, canvasheight );
	clear();
	
	background(COLORS[BACKGROUND_COLOR]);
	
	var copydiv = document.getElementById("copydiv")
	copydiv.innerHTML = "";
	
	for (var i = 0; i < textlist.length; i++){
		var x = ( i % TEXT_COLUMNS );
		var y = Math.floor( i / TEXT_COLUMNS );
		var currentglyph = textlist[i]; console.log(currentglyph)
		drawGlyph(currentglyph, x, y);
		
		if (x == 0 && y > 0){
			copydiv.innerHTML += "<br>";
		}
		
		// puts text into the copyable area beneath the image
		// fullwidth text chars are written directly
		if (currentglyph.charCodeAt(0) >= 0xFF00 && currentglyph.charCodeAt(0) <= 0xFFEF){
			copydiv.innerHTML += currentglyph;
			continue;
		}
		// unknown emoji are just left blank
		if (!GLYPHS[currentglyph]){ 
			copydiv.innerHTML += "　"; continue; 
		}
		var emoje = GLYPHS[currentglyph].emoji;
		if (!emoje){ 
			copydiv.innerHTML += "　"; continue; 
		}
		copydiv.innerHTML += emoje;
	}
}

function drawGlyph(glyphname, column, row){
	console.log("drawing " + glyphname);
	if (glyphname == " " || glyphname == "\n"){ return }
	var x = CHAR_PADDING + ( column * ( CHAR_DIM + CHAR_PADDING ) );
	var y = CHAR_PADDING + ( row * (CHAR_DIM + CHAR_PADDING ))	
	
	if (glyphname.charCodeAt(0) >= 0xFF00 && glyphname.charCodeAt(0) <= 0xFFEF){
		text(glyphname, x, y);
		return;
	}
	
	var img = GLYPHS[glyphname] ? GLYPHS[glyphname].img : GLYPHS["NO_EMOJI"].img;
	if (!img){ img = GLYPHS["NO_EMOJI"].img; }
	image(img,x,y,CHAR_DIM,CHAR_DIM);
}