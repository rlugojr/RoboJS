/**
 * Created by marco.gobbi on 09/12/2014.
 */

define(function (require, exports, module) {


    function Module() {
        return {
            createdCallback: function () {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "components.json");
                xhr.onload = this.handleLoaded.bind(this);
                xhr.send();

            },
            handleLoaded: function (e) {
                var thumbnails = JSON.parse(e.currentTarget.responseText);
                this.innerHTML = thumbnails.reduce(function (prev, curr) {
                    return prev.concat("<my-thumbnail id='"+curr+"'>" + curr + "</my-thumbnail>");
                }, "<div class='thumbnails'>").concat("</div>");


            },
            attachedCallback: function () {
                console.log("attached my-custom-element", this)
            },
            detachedCallback: function () {
                console.log("deattached my-custom-element", this)
            }
        }


    }


    module.exports = Module;
});