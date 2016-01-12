/**
 * Created by marco.gobbi on 21/01/2015.
 */

import EventDispatcher from "../events/EventDispatcher";


export default  function () {
    var nextUid = ()=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var MEDIATORS_CACHE = {};

    function create(node) {
        return function (Mediator) {
            var mediatorId = nextUid();

            node.setAttribute('mediatorid', mediatorId);

            var _mediator = Mediator(node,EventDispatcher);

            MEDIATORS_CACHE[mediatorId] = _mediator;
            _mediator.initialize();
            return _mediator;

        }
    }

    function destroy(node) {
        var mediatorId = node.getAttribute("mediatorid");
        var mediator = MEDIATORS_CACHE[mediatorId];
        if (mediator) {
            mediator.destroy && mediator.destroy();


            MEDIATORS_CACHE[mediatorId] = null;
            delete MEDIATORS_CACHE[mediatorId];
            mediator = null;
            return true;
        }
        return false;

    }

    var findMediators = (definitions, loader)=>node=> loader.load(definitions[node.getAttribute("data-mediator")]).then(create(node));

    var hasMediator = definitions=>node=>(definitions[node.getAttribute("data-mediator")] && !node.getAttribute("mediatorid"));
    var getAllElements = node=>[node].concat([].slice.call(node.querySelectorAll("[data-mediator]"), 0));

    return Object.freeze({

        destroy,
        findMediators,
        hasMediator,
        getAllElements

    })
};