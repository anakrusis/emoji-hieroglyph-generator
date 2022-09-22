TEXT_COLUMNS = 32;
SPACES_DRAWN = true;
TRANSPARENT = true;
CHAR_DIM = 48;
CHAR_PADDING = 4;

function setup(){	
	document.getElementById("btn").onclick = function(){
		SPACES_DRAWN = document.getElementById("spacecb").checked;
		TRANSPARENT = document.getElementById("transcb").checked;
		
		var colnum = document.getElementById("colnum").value;
		colnum = Math.max( colnum, 2 ); colnum = Math.min( colnum, 128 );
		document.getElementById("colnum").value = colnum;
		TEXT_COLUMNS = colnum;
		
		var csn = document.getElementById("charsizenum").value;
		csn = Math.max( csn, 8 ); csn = Math.min( csn, 128 );
		document.getElementById("charsizenum").value = csn;
		CHAR_DIM = csn;
		
		textAlign(LEFT, TOP)
		textSize(CHAR_DIM);
		fill(255)
		
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
		var ccode = text.charCodeAt(i);
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
	
	print(textlist)
	
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
	
	if (!TRANSPARENT){ background(54,57,63); }
	
	for (var i = 0; i < textlist.length; i++){
		var x = ( i % TEXT_COLUMNS );
		var y = Math.floor( i / TEXT_COLUMNS );
		drawGlyph(textlist[i], x, y);
	}
}

function drawGlyph(glyphname, column, row){
	if (glyphname == " " || glyphname == "\n"){ return }
	var x = CHAR_PADDING + ( column * ( CHAR_DIM + CHAR_PADDING ) );
	var y = CHAR_PADDING + ( row * (CHAR_DIM + CHAR_PADDING ))	
	
	if (glyphname.charCodeAt(0) >= 0xFF00 && glyphname.charCodeAt(0) <= 0xFFEF){
		text(glyphname, x, y);
		return;
	}
	
	var img = GLYPHS[glyphname] ? GLYPHS[glyphname].img : GLYPHS["NO_EMOJI"].img;
	image(img,x,y,CHAR_DIM,CHAR_DIM);
}