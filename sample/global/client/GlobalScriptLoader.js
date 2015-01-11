/**
 * Created by marco on 10/01/2015.
 */

// this is a naive GlobalScriptLoader just to show that is possible to get Mediators from global
//
function GlobalScriptLoader() {
}


GlobalScriptLoader.prototype = {

    get: function (path) {
        var mediator = _.chain(path.split("."))
            .reduce(function (result, key) {
                return result[key]
            }, window)
            .value();

        return Promise.resolve(mediator);
    }
};
