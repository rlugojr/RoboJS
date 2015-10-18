/**
 * Created by marco.gobbi on 09/12/2014.
 */
define(function (require, exports, module) {


	function BarElement() {
		var proto = Object.create(HTMLElement.prototype);
		proto.createdCallback = function () {
			console.log("created", this);
			this.addEventListener("click",function(e){
				e.currentTarget.parentElement.removeChild(e.currentTarget);
				e.stopPropagation();
			})
		};
		proto.attachedCallback = function () {
			console.log("attached", this)
		};
		proto.detachedCallback = function () {
			console.log("detachedCallback", this)
		};
		document.registerElement("bar-element", {prototype: proto})
	}


	module.exports = BarElement;
});