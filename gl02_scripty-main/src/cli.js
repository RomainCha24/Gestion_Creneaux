const fs = require('fs');
const colors = require('colors');
const Cruparser = require('./Cruparser');

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;

var creneau = require('./creneau.js');
var cour = require('./cour.js');

cli
	.version('cru-parser-cli')
	.version('0.07')
	// check Parser
	.command('check', 'Check if <file> is a valid cru file')
	.argument('<file>', 'The file to check with cru parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new Cruparser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);

			if(analyzer.error_count === 0){
				logger.info("The .cru file is a valid cru file".green);
			}else{
				logger.info("The .cru file contains error".red);
			}
			console.log(analyzer.error_count);


            var result = analyzer.parsedCour;
            //console.log(result[0]);

            

		});
			
	})

	.command('salle', 'regarde la salle en fonction du cours')
	.argument('<file>','The file used')
	.argument('<needle>','l ue dans laquelle l utilisateur va afficher la salle')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new Cruparser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);

			if(analyzer.error_count === 0){
				logger.info("The .cru file is a valid cru file".green);
				var result = analyzer.parsedCour;
				for(i=0;i<result.length;i++){
				
					if(result[i].ue === args.needle){
					
						for(j=0;j<result[i].creneaux.length;j++){
				
							console.log(result[i].creneaux[j].salle);
						
							}
						}
					}
			}else{
				logger.info("The .cru file contains error".red);
			}
		})
	})
	
	.command('capacite', 'trouve la capacite max d une salle')
	.argument('<file>','The file used')
	.argument('<needle>','l ue dans laquelle l utilisateur va afficher la capacite')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new Cruparser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);

			if(analyzer.error_count === 0){
				logger.info("The .cru file is a valid cru file".green);

				var result = analyzer.parsedCour;
				var current_max = 0;
				for(i=0;i<result.length;i++){
					
						for(j=0;j<result[i].creneaux.length;j++){
							
							if(result[i].creneaux[j].salle === args.needle){
								var tab_temp = result[i].creneaux[j].place;
								if(tab_temp > current_max){
									var current_max = tab_temp;
								}
							}
						}
					}
			}else{
				logger.info("The .cru file contains error".red);
			}
			console.log(current_max);
		})
	})

	.command('dispSalleCreneau', 'Donne la disponibilité des salle sur un créneau')
	.argument('<file>', 'Le fichier sur lequel on veut vérifier la disponibilité')
	.argument('<creDeb>', 'Le debut du creneau')
	.argument('<creFin>', 'Le creneau de fin')
	.option('-j, --jour', 'Si nous souhaitons un jour en particulier dans la semaine', { validator : cli.STRING, default: "" })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new Cruparser();
			analyzer.parse(data);

			creDeb = args.creDeb;
			creFin = args.creFin;
			jour = options.jour;

			//Vérifie si le créneau donné est incohérent
			if(analyzer.error_count === 0){
				if(creDeb.split(':')[0] > creFin.split(':')[0]){
					return console.log('Créneau non valide (heure du creneau de fin est plus petit que le creneau du debut')
				}
				
				if(creDeb.split(':')[0] == creFin.split(':')[0]){
					if(creDeb.split(':')[1] > creFin.split(':')[1]){
						return console.log('Créneau non valide (heure du creneau de fin est plus petit que le creneau du debut')
					}
				}

				//On va retirer les créneaux qui ne correspondent pas à notre demande dans une copie de tous nos cours
				var tabCreneauDisp = [].concat(analyzer.parsedCour);
				
				//Parcours les cours
				for (let i=analyzer.parsedCour.length-1; i>=0; i--){
					var cour = analyzer.parsedCour[i];

					//Parcours les créneaux
					for(let j=analyzer.parsedCour[i].creneaux.length-1; j>=0; j--){
						var creneau = cour.creneaux[j];

						if(jour == ""){
							//Si le créneau ne corresponds pas à notre demande
							if(!estDansCreneau(creneau, creDeb, creFin)){
								//On le retire
								tabCreneauDisp[i].creneaux.splice(j, 1);
							}
						}else{
							//Si le jour corresponds à notre demande
							if(creneau.jour != jour){
								tabCreneauDisp[i].creneaux.splice(j, 1);
							}else{
								if(!estDansCreneau(creneau, creDeb, creFin)){
									tabCreneauDisp[i].creneaux.splice(j, 1);
								}
							}
						}
					}

					//s'il n'y a plus de créneaux d'une matière, onenlève la matière
					if(tabCreneauDisp[i].creneaux.length == 0){
						tabCreneauDisp.splice(i,1);
					}
				}

				console.log(tabCreneauDisp);
			}

		});
			
		function estDansCreneau(creneau, creDeb, creFin) {
			return (creneau.debut.split(":")[0] >= creDeb.split(":")[0] && creneau.fin.split(":")[0] <= creFin.split(":")[0]);
		}
	})

	.command('disponibility', "Consulter la disponibilité d'une salle dans une semaine")
	.alias('disp')
	.argument('<file>', 'Le fichier de créneaux à utiliser')
	.argument('<salle>', 'La salle dont on veut vérifier la disponibilité')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
		analyzer = new Cruparser();
		analyzer.parse(data);
		if (!(args.salle.match("([A-Z][0-9]{3}|[A-Z]{3}[0-9])")) | args.salle.length>4){
			return console.log("La salle saisie n'est pas valide".red);
		}
		if(analyzer.error_count === 0){
			var salleasked = new RegExp(args.salle);
			console.log("Salle demandée : ".green + salleasked);
			var filtered=[];
				for (var i=0; i<analyzer.parsedCour.length; i++){
					// On récupère tous les créneaux utilisés par la salle pour chaque cours
					var filteredAdd = analyzer.parsedCour[i].creneaux.filter(p => p.salle.match(salleasked, 'i')); 
					if (filteredAdd.length != 0){
						filtered.push(filteredAdd);//Tous les créneaux utilisés par la salle, indépendamment du cours qui utilise la salle
					}
				}
			var Weeks =['F1', 'F2'];
			for (var Week in Weeks){
				var weekasked= new RegExp(Weeks[Week]);
				//Affichage de la semaine sélectionnée 
				console.log("Créneaux pour lesquels la salle est libre en semaine : ".cyan + Weeks[Week]);
				var filteredWeek = [];
				for (var i=0; i<filtered.length; i++){
					// On récupère les créneaux de la salle pour la semaine demandée
					var filteredWeekAdd = filtered[i].filter(d => d.semaine.match(weekasked, 'i'));
					if (filteredWeekAdd.length != 0){
						filteredWeek.push(filteredWeekAdd);//Tous les créneaux utilisés par la salle durant cette semaine
					}
				}
				var Days=['L', 'MA', 'ME', 'J', 'V', 'S', 'D'];
				for (var Day in Days){ 
					var dayasked = new RegExp(Days[Day]);
					var filteredDay = [];
					for (var i=0; i<filteredWeek.length; i++){
						// On récupère les créneaux de la salle pour le jour demandé
						var filteredDayAdd = filteredWeek[i].filter(d => d.jour.match(dayasked, 'i'));
						if (filteredDayAdd.length != 0){
							filteredDay.push(filteredDayAdd);//Tous les créneaux utilisés par la salle pour un jour dans une semaine
					}
					}
					var creneauxlibres = [];//Liste des créneaux durant laquelle la salle est libre
					var debutsdecreneaux = [];//Liste des horaires auxquelles un cours commence (=> la salle n'est plus libre)
					var finsdecreneaux = [];//Liste des horaires auxquelles un cours commence(=> la salle est de nouveau libre)
					for (var i=0; i<filteredDay.length; i++){
						for(var j=0; j<filteredDay[i].length; j++){
							var debutdecreneau=filteredDay[i][j].debut;
							if (debutdecreneau.length==4){
								debutdecreneau='0'+debutdecreneau;
							}
							var findecreneau=filteredDay[i][j].fin;
							if (findecreneau.length==4){
								findecreneau='0'+findecreneau;
							}
							//On récupère l'ensemble des horaires auxquelles un cours commence et se termine
							debutsdecreneaux.push(debutdecreneau);
							finsdecreneaux.push(findecreneau);
						}
					}
					//Les horaires sont triées 
					debutsdecreneaux.sort();
					finsdecreneaux.sort();
					creneauxlibres.push(new Object);
					if (filteredDay.length==0){//Si la salle n'est pas utilisée de la journée
						creneauxlibres[0].heuredebut='08:00';
						creneauxlibres[0].heurefin = '20:00';
					}
					else{
						if (debutsdecreneaux[0]!='08:00'){//s'il n'y a pas de cours qui commence à 8:00, le premier créneau où la salle est libre commence automatiquement à 8:00
							creneauxlibres[0].heuredebut='08:00';
							creneauxlibres[0].heurefin = debutsdecreneaux[0];
						}
						for (var j=1; j<debutsdecreneaux.length; j++){
							creneauxlibres.push(new Object);
							//Création d'un nouveau créneau où la salle est libre : débute à la fin du dernier cours et se termine à la fin du suivant
							if (finsdecreneaux[j-1]!=debutsdecreneaux[j]){
								creneauxlibres[j].heuredebut=finsdecreneaux[j-1];
								creneauxlibres[j].heurefin=debutsdecreneaux[j];
							}
						}
						if (creneauxlibres[j-1].heurefin!='20:00' && finsdecreneaux[j-1]!='20:00'){//Si aucun cours ne se termine à 20:00, le dernier créneau où la salle est liebre se termine automatiquement à 20:OO
							creneauxlibres.push(new Object);
							creneauxlibres[j].heuredebut = finsdecreneaux[j-1];
							creneauxlibres[j].heurefin='20:00';	
						}
						creneauxlibres=creneauxlibres.filter(x => x.heuredebut!=undefined);
					}
					//Affichage en fonction du jour
					switch(Days[Day]){
						case 'L' : console.log('Créneaux du Lundi pendant lesquels la salle est libre :'.yellow);break;
						case 'MA' : console.log('Créneaux du Mardi pendant lesquels la salle est libre :'.yellow);break;
						case 'ME' : console.log('Créneaux du Mercredi pendant lesquels la salle est libre :'.yellow);break;
						case 'J' : console.log('Créneaux du Jeudi pendant lesquels la salle est libre :'.yellow);break;
						case 'V' : console.log('Créneaux du Vendredi pendant lesquels la salle est libre :'.yellow);break;
						case 'S' : console.log('Créneaux du Samedi pendant lesquels la salle est libre :'.yellow);break;
						case 'D' : console.log('Créneaux du Dimanche pendant lesquels la salle est libre :'.yellow);break;
						default : console.log("Aucun jour sélectionné");
					}
					//Affichage de tous les créneaux séléctionnés
					for (var i=0; i<creneauxlibres.length;i++){
						console.log(creneauxlibres[i].heuredebut+'-'+creneauxlibres[i].heurefin);
					}
				}
			}				
		}
		else{
			logger.info("The .cru contains error".red);
		}
		});
	})

	.command('tauxoccupation', "Affiche le suivi de l'occupation de chaque salle")
	.alias('tauxocc')
	.argument('<file>', 'Le fichier de créneaux à utiliser')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
		analyzer = new Cruparser();
		analyzer.parse(data);
		if(analyzer.error_count === 0){
			var TauxOccupation = new Map();
			var nbcreneaux = 0;
			for (var i=0; i<analyzer.parsedCour.length; i++){
				nbcreneaux+=analyzer.parsedCour[i].creneaux.length;
			}
			console.log("Il y a ".green+nbcreneaux+" créneaux au total".green);
			for (var i=0; i<analyzer.parsedCour.length; i++){
				for (var j=0; j<analyzer.parsedCour[i].creneaux.length; j++){
					
					if (TauxOccupation.get(analyzer.parsedCour[i].creneaux[j].salle)==undefined){
						
						TauxOccupation.set(analyzer.parsedCour[i].creneaux[j].salle, 1/nbcreneaux*100);
					}
					else{
						TauxOccupation.set(analyzer.parsedCour[i].creneaux[j].salle,TauxOccupation.get(analyzer.parsedCour[i].creneaux[j].salle) + 1/nbcreneaux*100);
					}
					
				}
			}
			TauxOccupation = new Map([...TauxOccupation.entries()].sort((a,b) => a[1] - b[1]));
			var TauxOccupationArray = new Array;
			TauxOccupation.forEach((values, keys) =>{
				TauxSalle=new Object;
				TauxSalle.salle=keys;
				TauxSalle.taux=values;
				TauxOccupationArray.push(TauxSalle);
			})
			console.log(TauxOccupationArray);
			var TauxChart = {
				"data" : {
						"values" : TauxOccupationArray
				},
				"mark" : "bar",
				"encoding" : {
					"x" : {"field" : "salle", "type" : "ordinal",
							"axis" : {"title" : "Salle utilisée"}
						},
					"y" : {"field" : "taux", "type" : "quantitative",
							"axis" : {"title" : "Taux d'occupation (en %)"}
						}
				}
			}
			const myChart = vegalite.compile(TauxChart).spec;
			
			/* Version SVG */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./result.svg", res)
				view.finalize();
				logger.info("Chart output : ./result.svg");
			});
		}
		else{
			logger.info("The .cru contains error".red);
		}
		});
	})	

	.command('checkValidite', 'Check if <file> is a valid cru file')
	.argument('<file>', 'The file to check with cru parser')
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new Cruparser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);

			var analyzer = new Cruparser();
			analyzer.parse(data);
			var tab = analyzer.parsedCour;
            
			for(let i=0; i<tab.length; i++){
				var cour = analyzer.parsedCour[i];
				for(j=0;j<cour.creneaux.length;j++){


					for(let k=0; k<tab.length; k++){
						var cour2 = analyzer.parsedCour[k];
						for(l=0;l<cour2.creneaux.length;l++){

							if(i != k && j != l){
								if(cour.creneaux[j].salle == cour2.creneaux[l].salle){
									if(cour.creneaux[j].jour == cour2.creneaux[l].jour){
										if(cour.creneaux[j].debut == cour2.creneaux[l].debut){
											if(cour.creneaux[j].fin <= cour2.creneaux[l].fin){

												if(i != k && j != l){}
												console.log("Incohérence dans le fichier".red);

												console.log("cour : " + cour.ue + "\nsalle : " + cour.creneaux[j].salle + "\njour : " + cour.creneaux[j].jour + "\ndebut : " + cour.creneaux[j].debut + "\nfin : " + cour.creneaux[j].fin + "\n");

												console.log("cour :" + cour2.ue + "\nsalle : " + cour2.creneaux[l].salle + "\njour : " + cour2.creneaux[l].jour + "\ndebut : " + cour2.creneaux[l].debut + "\nfin : " + cour2.creneaux[l].fin);
												return;
											}
										}
									}
								}
							}
						}
					}
				}
			}
			console.log("Fichier Valide".green);

		});
			
	})


cli.run(process.argv.slice(2));

