var SECTIONS = {
	"phonetic": 	document.getElementById("dict_phonetic"),
	"coreword": 	document.getElementById("dict_coreword"),
	"verb": 		document.getElementById("dict_verb"),
	"adjadv": 		document.getElementById("dict_adjadv"),
	"noun": 		document.getElementById("dict_noun"),
	"exp": 			document.getElementById("dict_exp"),
	"misc": 		document.getElementById("dict_misc")
}

var SIGNS_COUNT = 0;

for (key in GLYPHS) {
	var glyph = GLYPHS[key];
	if (key == "NO_EMOJI"){ continue; }
	
	var namestring = key;
	// names longer than one char have to be put in brackets
	if (namestring.length > 1){
		namestring = "[" + namestring + "]";
	}
	if (glyph.aliases){
		namestring += ", ";
		for (var i = 0; i < glyph.aliases.length; i++){
			var aliasstring = glyph.aliases[i];
			if (aliasstring.length > 1){
				aliasstring = "[" + aliasstring + "]";
			}
		
			namestring += aliasstring + ", ";
		}
		// gets rid of the extra comma and space at the end
		namestring = namestring.slice(0, -2)
	}
	
	SIGNS_COUNT++;

	// old unsorted definitions are automatically be placed in the misc category
	if (!(typeof glyph.use === "object")){
		addDictEntry("misc", namestring, key, glyph.use);
		continue;
	}
	// a glyph's definition is now stored in an object with multiple keys to different parts of speech
	for (sect in glyph.use){
		addDictEntry(sect, namestring, key, glyph.use[sect]);
	}
}
document.getElementById("counterdiv").innerHTML = "Number of unique signs: " + SIGNS_COUNT;

function addDictEntry(section, namestring, imgname, definition){
	var dict = SECTIONS[section];
	var newrow = dict.insertRow();
	var namecell = newrow.insertCell();
	namecell.innerHTML = namestring;
	
	var imgcell = newrow.insertCell();
	imgcell.innerHTML = "<img src='emoji/" + imgname + ".png'>"
	
	var usecell = newrow.insertCell();
	if (definition){
		usecell.innerHTML = definition;
	}
}