/**
 * Created by marco.gobbi on 10/11/2014.
 */
requirejs.config({
    paths: {

        robojs: "../../dist/robojs.es6"

    }
});
require(["./application"], function (app) {app()});
