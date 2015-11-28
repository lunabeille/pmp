all : bower_components src/bower

bower_components:
	bower install jquery requirejs

src/bower:
	cd src
	ln -s ../bower_components bower