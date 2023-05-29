# GL02_scripty
### Installation
$ npm install

Jeux de données: 
dans le dossier  /data
   - edt.cru


Commande:check
check si le fichier correspond  à un  fichier cru
node .\cli.js  <command>  <fichier>
exemple:
node .\cli.js  check  .\edt.cru  

Commande: salle
Trouver les salles en fonction du cours entrée par le user: 
node .\cli.js <command> <fichier_de_donnée> <nom_du_cours> 
exemples:
node .\cli.js salle .\edt.cru SC04
node .\cli.js salle .\edt.cru SG11

Commande: capacite
Récupérer la capacité max d’une salle 
node .\cli.js <command> <fichier_de_donnée> <nom_de_la_salle> 
exemples: 
node .\cli.js capacite edt.cru B101
node .\cli.js capacite edt.cru A105

Commande : dispSalleCreneau

Permet de trouver un créneau et de les renvoyer, pour chaque jour de la semaine.

node .\cli.js dispSalleCreneau  <file> <creneau Debut> <creneau Fin> <option> <arg>

option : 
	-j, –jour : Cherche si le créneau est présent dans un jour de la semaine

exemples :
node .\cli.js dispSalleCreneau .\edt.cru "10:00" "12:00"
node .\cli.js dispSalleCreneau .\edt.cru "10:00" "12:00" -j "MA"

Commande : disponibility
alias : disp
Permet de connaître l’ensemble des horaires auxquelles une salle est disponible, pour chaque semaine et chaque jour.
Commande à exécuter : 
node .\cli.js disp <file> <salle>
exemple:
node .\cli.js disp .\edt.cru S102

Commande : checkValidite

Vérifie si une bdd n’a pas d’incohérence au niveau des créneaux (2 créneaux identiques)
node .\cli.js checkValidite <file>

exemples :
node .\cli.js checkValidite.\edt.cru

Commande : tauxoccupation
alias : tauxocc
Permet de connaître le taux d’occupation de chaque salle en fonction du nombre total de créneaux utilisés dans le fichier cru. Créer un graphique contenant le nom des salles en abscisse et leur taux d’occupation en ordonnée.
Commande à exécuter : 
node .\cli.js tauxocc <file> 
exemple:
node .\cli.js tauxocc .\edt.cru 

écart cahier des charges : 
Nous n’avons pas fait la spec5 par manque de compréhension du code ics.
Il n’y avait pas de sémantique de cours dans le cahier des charges. 



