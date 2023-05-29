var creneau = require('./creneau.js');
var cour = require('./cour.js');

//Cruparser

var Cruparser = function(sTokenize, sParsedSymb){
    //the list of creneau parsed from the input files
    this.parsedCour = [];
    //this.symb = [""]
    this.symb = ["","+","1","P","H","S","//","//\n\n","$$","$"];
    this.showTokenize = sTokenize;
    this.showParsedSymb = sParsedSymb;
    this.error_count = 0;
}

//Cruparser function

//tokenize
Cruparser.prototype.tokenize = function(data){
    var separator = /(\r\n)/; //ou  \r|\n si ne fonctionne pas
    data = data.split(separator);
    separator = /([+]|=|,|[\/][\/])/;
    data = data.filter((val,index) => val.match(separator));
    data.splice(0,3);
    data.push('$$');
    return data;
}


//erreurmsg
Cruparser.prototype.erreurmsg = function(msg,input){
    this.error_count++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

//parse
Cruparser.prototype.parse = function(data){
    var tdata = this.tokenize(data);
    if(this.showTokenize) console.log(tdata);
    this.listeCour(tdata);
}

//next
Cruparser.prototype.next = function(input){
    var cursor = input.shift();
    if(this.showParsedSymb) console.log(cursor);
    return input[0].charAt(0);
}

//accept
Cruparser.prototype.accept = function(s){
    var index = this.symb.indexOf(s);
    if(index === -1 ){
        this.erreurmsg("symbol "+s+" unknown", [" "]);
        return false;
    }
    return index;
}

//check
Cruparser.prototype.check = function(s,input){
    if(this.accept(input[0].charAt(0)) == this.accept(s)){
		return true;	
	}
	return false;
}

//expected
Cruparser.prototype.expect = function(s,input){
    if(input[1] === '$$'){
        return true;
    }
    else if(s == this.next(input)){
        return true;
    }else {
        this.erreurmsg("symbol "+s+" doesn't match", input);
    }
    return false;
}


///Cruparser rules
Cruparser.prototype.listeCour = function(input) {
    this.cour(input);
    this.expect("$$", input);
}


Cruparser.prototype.cour = function(input) {
    if(this.check("+",input)){ //input[0].charAt(0) === "+"
        var ue = input[0].split("+")[1];
        var tab = [];
        this.expect("1" , input);
        this.creneaux(input,tab);
        var c = new cour(ue,tab);
        this.parsedCour.push(c);
        if(input.length > 0){
            this.cour(input);
        }
        return true;
    }return false;
}

Cruparser.prototype.creneaux = function(input, tab){
    if(this.check("1",input)){ //input[0].charAt(0) === "1"
        var args = this.body(input);
        var c = new creneau(args.type, args.place, args.jour, args.debut, args.fin, args.semaine,args.salle);
        tab.push(c);
        if(input[1].charAt(0) === "1"){
            this.expect("1" , input);
            this.creneaux(input, tab);
        }
        else this.expect("+" , input);
        return true;
    }return false;
}

Cruparser.prototype.body = function(input) {
    if(input[0].match(/^\d,[A-Z]\d,P=\d{1,3},H=[A-Z]{1,2} \d{1,2}:\d\d-\d{1,2}:\d\d,(F1|F2|FA),S=(\w{1,4})*\/\/$/)){
        var type = this.type(input);
        var place = this.place(input);
        var jour = this.jour(input);
        var debut = this.debut(input);
        var fin = this.fin(input);
        var semaine = this.semaine(input);
        var salle = this.salle(input);
        return { type: type, place: place, jour: jour, debut: debut, fin: fin, semaine: semaine, salle: salle};
    }else {
        this.erreurmsg("creneau doesn't match",input[0]);
        return false;
    }
    
}

Cruparser.prototype.type = function(input){
    data = input[0].split(",");
    return data[1];
}

Cruparser.prototype.place = function(input){
    data = input[0].split(",");
    return data[2].split("=")[1];
}

Cruparser.prototype.jour = function(input){
    data = input[0].split(",");
    return data[3].split(" ")[0].split("=")[1];
}

Cruparser.prototype.debut = function(input) {
    data = input[0].split(",");
    return data[3].split(" ")[1].split("-")[0];
}

Cruparser.prototype.fin = function(input) {
    data = input[0].split(",");
    return data[3].split(" ")[1].split("-")[1];
}

Cruparser.prototype.semaine = function(input) {
    data = input[0].split(",");
    return data[4];
}

Cruparser.prototype.salle = function(input) {
    data = input[0].split(",");
    return data[5].split("=")[1].split("//")[0];
}

module.exports = Cruparser;








