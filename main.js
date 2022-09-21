TEXT_COLUMNS = 5;
SPACES_DRAWN = true;
CHAR_DIM = 72;
CHAR_PADDING = 4;

function setup(){
	document.getElementById("btn").onclick = function(){
		var text = document.getElementById("textarea").value;
		transcribeText(text);
	}
}

function preload(){
	GLYPHS = {
		// phonetic glyphs first
		"'":   loadImage("emoji/eye.png"),
		"b":   loadImage("emoji/bee.png"),
		"bl":  loadImage("emoji/bell.png"),
		"ch":  loadImage("emoji/hatching_chick.png"),
		"d":   loadImage("emoji/door.png"),
		"f":   loadImage("emoji/fire.png"),
		"g":   loadImage("emoji/gear.png"),
		"h":   loadImage("emoji/rabbit.png"),
		
		"error":  loadImage("emoji/NO_EMOJI.png"),
	}
}

function draw(){
	
}

function transcribeText(text){
	// will append words to these tables until there isnt any room left
	var textrows = [[]];
	var currrow = 0;
	var currcol  = 0;
	var currword = "";
	var inbracket = false;
	
	// Its janky but this just add a space to the end so the last (or only) word is seen as a word
	if (text.charAt( text.length - 1 ) != " "){
		text += " ";
	}
	
	// the first pass separates the rows for word wrap
	for (var i = 0; i < text.length; i++){
		var cc = text.charAt(i); // current char
		if (cc == " " || cc == "\n"){

			// word gets wrapped to the next line
			if (currcol > TEXT_COLUMNS){
				currrow++;
				currcol = 0;
				textrows[currrow] = [currword];
				
			// word is put on the current line
			}else{
				textrows[currrow].push(currword);
				currcol++;
			}
			// newline forced
			if (cc == "\n"){
				currrow++;
				currcol = 0;
				textrows[currrow] = [];
			}
			
			currword = "";
			
		}else{
			if (cc == "["){
				inbracket = true;
			}
			if (cc == "]"){
				inbracket = false;
			}
			currword += cc;
			// text in brackets don't count towards the column count (except the final ] character)
			// this is because it will become one character
			if (!inbracket){
				currcol++;
			}
		}
	}
	var canvaswidth = CHAR_PADDING + (TEXT_COLUMNS * (CHAR_DIM + CHAR_PADDING))
	var canvasheight = CHAR_PADDING + (textrows.length * (CHAR_DIM + CHAR_PADDING))
	resizeCanvas( canvaswidth, canvasheight );
	clear();
	
	// the second pass reads word groupings and places the emojii accordingly
	for (var row = 0; row < textrows.length; row++){
		var column = 0;
		
		for (var wi = 0; wi < textrows[row].length; wi++){
			var word = textrows[row][wi];
			var inbrackets = false;
			var currentgrouping = "";
			
			// iterating through the chars in the word
			for (var li = 0; li < word.length; li++){
				var ltr = word.charAt(li);
				if (inbrackets){
					if (ltr == "]"){
						inbrackets = false;
					}else{
						currentgrouping += ltr;
					}
					
				// outside of brackets, individual letters are parsed
				}else{
					if (ltr == "["){
						inbrackets = true;
					}else{
						drawGlyph(ltr, column, row);
						column++;
					}
				}
			}
		}
	}
}

function drawGlyph(glyphname, column, row){
	var img = GLYPHS[glyphname] ? GLYPHS[glyphname] : GLYPHS["error"];
	var x = CHAR_PADDING + ( column * ( CHAR_DIM + CHAR_PADDING ) );
	var y = CHAR_PADDING + ( row * (CHAR_DIM + CHAR_PADDING ))
	image(img,x,y,CHAR_DIM,CHAR_DIM);
}