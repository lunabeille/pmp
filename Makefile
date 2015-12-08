all : bower_components src/bower

bower_components:
	bower install jquery requirejs

src/bower:
	ln -s ../bower_components src/bower
