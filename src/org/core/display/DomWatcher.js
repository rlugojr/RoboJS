import Signal from "../events/Signal";
import R from "ramda";
export default function DomWatcher() {
    let onAdded = Signal();
    let onRemoved = Signal();
    let _handleMutations = R.reduce(function (result, mutation) {
        result.addedNodes = result.addedNodes.concat(Array.prototype.slice.call(mutation.addedNodes));
        result.removedNodes = result.removedNodes.concat(Array.prototype.slice.call(mutation.removedNodes));
        return result;
    }, {addedNodes: [], removedNodes: []});

    let handleMutations = (mutations)=> {
        let response = _handleMutations(mutations);
        response.addedNodes.length && onAdded.emit(response.addedNodes);
        response.removedNodes.length && onRemoved.emit(response.removedNodes);
    };
    let observer = new MutationObserver(handleMutations);

    /* <h3>Configuration of the observer.</h3>
     <p>Registers the MutationObserver instance to receive notifications of DOM mutations on the specified node.</p>
     */
    observer.observe(document.body, {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
    });
    return {
        onAdded: onAdded,
        onRemoved: onRemoved
    }
};

