/*
 * Copyright JDB-SoftSystems - 2021
 * Material Property of JDB Soft-Systems
 * Jacksonville, Florida
 * 
 * https://www.jdbss.com
 * 
 * For license information please see LICENSE.txt 
 *  
*/
; (function ($, window, document, undefined) {
    "use strict";

    // ******************************************************************************** //
    // Create the defaults once
    // ******************************************************************************** //
    var pluginName = "jdbssDropdown",
        document = window.document,
        defaults = {
            default: "true",
            nameprefix: "jdbss_dropdown",
            datasource: "inline",
            data: "",
            indexcolumn: 0,
            valuecolumn: -1,
            showindex: false,
            bootstrapcol: null,
            headingclass: null,
            dataclass: null,
            headings:null,
            display: {
                caret: "fontawesome",
                width: "800px"
            },
            dropdownopened_callback: function () { },
            dropdownclosed_callback: function () { },
            rowselected_callback: function () { }
        };
    // ******************************************************************************** //

    // ******************************************************************************** //
    // The actual plugin constructor
    // ******************************************************************************** //
    function PlugIn(element, options) {


        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        //All variables & Local
        this.$container = null;
        this.container = element.id;

        this.ClassHide = "jdbss-dropdown-hide";
        this.ClassShow = "jdbss-dropdown-show";
        this.ClassActive = "active";
        this.ClassSelected = "jdbss-dropdown-selected";
        this.ClassBottom = "jdbss-dropdown-border-dd-bot";
        this.ClassCaret = "dropdown-toggle";
        this.ClassRow = "jdbss-dropdown-row";
        this.ClassInputGroup = "input-group-text";
        this.ClassButton = "btn";
        this.AriaExpand = "aria-expanded";
        this.AriaControls = "aria-controls";
        this.AriaIndex = "aria-index";

        this.initCompleted = false;
        this.DATASOURCE = { INLINE: "inline", JSON: "json" };
        this.STATES = { CLOSED: "closed", EXPANDED: "expanded" }
        this.CARETS = { BOOTSTRAP: "bootstrap", FONTAWESOME: "fontawesome" }
        this.state = this.STATES.CLOSED;
        this.$dropdownIcon = null;
        this.$dropdown = null;
        this.$dropdown_data = null;
        this.$dropdown_input = null;
        this.controlId = "";
        this.data = "";
        this.Rows = "";
        this.$Rows = [];
        this.Headings = [];
        this.Colsize = [];

        this.init();
    }
    // ******************************************************************************** //

    // ******************************************************************************** //
    // ******************************************************************************** //
    $.extend(PlugIn.prototype, {

        init: function () {
            if (this.settings != null) {
                this.state = this.STATES.CLOSED;
            }

            this.__setupFunction();
            this.initCompleted = true;
            this.__size_position();

        },

        __dropdown_click: function (ctrl) {

            if (this.state === this.STATES.CLOSED) {
                //this.__size_position();

                this.state = this.STATES.EXPANDED;
                this.$dropdown_data.removeClass(this.ClassHide);
                this.$dropdown_data.addClass(this.ClassShow);
                this.$dropdownIcon.attr(this.AriaExpand, 'true');
                this.__callback_open(ctrl);
            }
            else {
                this.state = this.STATES.CLOSED;
                this.$dropdown_data.removeClass(this.ClassShow);
                this.$dropdown_data.addClass(this.ClassHide);
                this.$dropdownIcon.attr(this.AriaExpand, 'false');
                this.__callback_close(ctrl);
            }
        },

        __dropdown_selectrow_click: function (ctrl) {
            var rowid = ctrl.currentTarget.id;
            var idx = "";
            var text = "";
            var xThis = this;

            this.$dropdown.find('.row ,active').each(function () {
                $(this).removeClass(xThis.ClassActive);
                $(this).removeClass(xThis.ClassSelected);
            });

            $("#" + rowid).addClass(this.ClassActive);
            $("#" + rowid).addClass(this.ClassSelected);

            $("#" + "dd-input-" + this.controlId + "-" + parseInt(rowid.substring(rowid.lastIndexOf("-") + 1))).prop('checked', true);;

            if ($("#" + rowid).find('.jdbss-dropdown-value')[0] !== undefined)
                text = $("#" + rowid).find('.jdbss-dropdown-value')[0].innerText;

            if ($("#" + rowid).find('.jdbss-dropdown-index')[0] !== undefined)
                idx = $("#" + rowid).find('.jdbss-dropdown-index')[0].innerText;


            this.$dropdown_input.val(text);
            this.$dropdown_input.attr(this.AriaIndex, idx);

            this.__callback_rowselected(ctrl);
            this.__dropdown_click(ctrl);

        },

        __size_position: function () {

            var iWidth = this.$container.width();
            var iWidthSent = parseInt(this.settings.display.width);

            if (iWidth > iWidthSent)
                iWidth = iWidthSent;

            this.$dropdown.css("width", iWidth  + 35 + "px");
            this.$dropdown.find(".pl-2").css("width", iWidthSent + "px");
            this.$dropdown.css("top", (this.$container.height() + this.$dropdown_input.position().top + 0) + "px");

        },
        __callback_open: function (ctrl) {

            if (this.initCompleted && this.settings.dropdownopened_callback !== null && this.settings.dropdownopened_callback !== undefined)
                this.settings.dropdownopened_callback(ctrl);

        },
        __callback_close: function (ctrl) {

            if (this.initCompleted && this.settings.dropdownclosed_callback !== null && this.settings.dropdownclosed_callback !== undefined)
                this.settings.dropdownclosed_callback(ctrl);
        },
        __callback_rowselected: function (ctrl) {

            if (this.initCompleted && this.settings.rowselected_callback !== null && this.settings.rowselected_callback !== undefined)
                this.settings.rowselected_callback(ctrl);
        },
        __setupFunction: function () {
            this.__writeOutput();
            this.__wireObjects();
            this.__wireEvents();
            this.__setupObjects();
        },

        __wireObjects: function () {
            this.$container = $("#" + this.container);
            this.$dropdownIcon = this.$container.find('.jdbss-dropdown-icon');
            this.controlId = this.$dropdownIcon.attr(this.AriaControls);

            if (this.settings.datasource === this.DATASOURCE.JSON) {
                this.__buildList();
            }

            this.$dropdown = this.$container.find('.jdbss-dropdown');
            this.$dropdown_input = this.$container.find('.jdbss-dropdown-input');
            this.$dropdown_data = $('#' + this.controlId);
        },

        __wireEvents: function () {


        },

        __writeOutput: function () {

        },

        __setupObjects: function () {
            var x = 0;
            var xThis = this;

            //==========================================================
            // Open the drop down if the user clicks on the input box or 
            // the associated icon.
            //==========================================================
            this.$dropdown_input.on('click', $.proxy(this.__dropdown_click, this));
            this.$dropdownIcon.on('click', $.proxy(this.__dropdown_click, this));


            this.$dropdown_input.attr("readonly", "true");
            this.$dropdownIcon.attr(this.AriaExpand, 'false');

            this.$dropdownIcon.addClass(this.ClassInputGroup);
            this.$dropdownIcon.addClass(this.ClassButton);
            if (this.settings.display.caret === this.CARETS.FONTAWESOME) {
                this.$dropdownIcon.prepend("<i class='fas fa-caret-square-down fa-1x'></i>");
            }
            else {
                this.$dropdownIcon.addClass(this.ClassCaret);
            }



            this.Rows = this.$dropdown.find('.row');
            this.$dropdown.find('.row').each(function () {
                var $this = $(this);
                x = x + 1;
                $this.addClass(xThis.ClassBottom);
                $this.addClass(xThis.ClassRow);
                $this.attr("id", "dd-row-" + xThis.controlId + "-" + x);
                if (x > 1) {
                    $this.prepend("<div class='col-1 jdbss-dropdown-option input-group-text jdbss-dropdown-border-none'><input class='m-auto' type='radio' name='r" + xThis.controlId + "' id='dd-input-" + xThis.controlId + "-" + x + "'></div>");
                }
            });


            for (x = 0; x < this.Rows.length; x++) {
                this.$Rows.push($("#" + this.Rows[x].id));
                if (x > 0)
                    this.$Rows[x].on('click', $.proxy(this.__dropdown_selectrow_click, this));
            }


        },


        __getHeadingText: function () {
            var headings = [];
            
            //======================================================
            //Move the Data passed in to the array
            //======================================================
            if (this.settings.headings !== null) {
                headings = this.settings.headings;
            }
            else {
                var temp = Object.entries(this.settings.data[0]);
                for (var key in temp){
                    headings.push(temp[key][0]);
                }
            }

            //======================================================
            //Make sure the Array is the same size as the Data
            //======================================================
            var obj = this.settings.data[0]
           
            if (headings.length < Object.entries(obj).length) {
                for (var x = headings.length; x < Object.entries(obj).length; x++) {
                    headings.push("");
                }
            }

            return headings;
        },
        __getColumnSize: function () {
            var colsize = [];

            //======================================================
            //Move the Data passed in to the array
            //======================================================
            if (this.settings.bootstrapcol !== null && this.settings.bootstrapcol !== undefined) {
                colsize = this.settings.bootstrapcol;
            }

            //======================================================
            //Make sure the Array is the same size as the headings
            //======================================================
            if ( colsize.length < this.Headings.length) {

                for (var x = colsize.length; x < this.Headings.length; x++) {
                    colsize.push("col");
                }
            }

            return colsize;
        },
        __getClassFromArray: function (classarray, arrayIndex) {
            var classname = "";

            if (classarray !== undefined && classarray !== null) {
                classname = classarray[arrayIndex];

                if (classname === null || classname === undefined)
                    classname = "";
            }

            return classname;
        },
        __buildList: function () {

            var y = 0;
            var str = "<div class='jdbss-dropdown jdbss-dropdown-hide' id='" + this.controlId + "'><div class='pl-2'" + ";'>";
               
            //==============================================================================
            // Build out the header Row
            //==============================================================================
            str = str + "<div class='row flex-nowrap jdbss-dropdown-row '>";
            str = str + "<div class='col-1 jdbss-dropdown-header dbss-dropdown-option-header'></div>";

            this.Headings = this.__getHeadingText();
            this.Colsize = this.__getColumnSize();


            for (key in this.Headings) {
                var headingclass = "";

                headingclass = this.__getClassFromArray(this.settings.headingclass, y);

                if (key == this.settings.indexcolumn && this.settings.showindex !== true) {
                    str = str + "<div class='" + this.Colsize[y] + " " + headingclass + " jdbss-dropdown-header' style='display:none;'></div>";
                }
                else {
                    str = str + "<div class='" + this.Colsize[y] + " " + headingclass + " jdbss-dropdown-header'>" + this.Headings[key] + "</div>";
                }
                y = y + 1;
            }
            str = str + "</div>";

            //==============================================================================
            // Build the data rows
            //==============================================================================
            for (var key in this.settings.data) {
                str = str + "<div class='row jdbss-dropdown-row  '>";
                var y = 0;
                var obj = this.settings.data[key];
                var combinedName = "";

                if (this.settings.valuecolumn === -1) {
                    for (const [key, value] of Object.entries(obj)) {
                        if (combinedName !== "")
                            combinedName = combinedName + " | ";
                        combinedName = combinedName + value;
                    }
                }

                for (const [key, value] of Object.entries(obj)) {
                    var dataclass = "";

                    dataclass = this.__getClassFromArray(this.settings.dataclass, y);


                    if (y == this.settings.indexcolumn && this.settings.showindex === true) {
                        str = str + "<div class='" + this.Colsize[y] + " " + dataclass + " jdbss-dropdown-index'>" + value + "</div>";
                    }
                    else if (y == this.settings.indexcolumn && this.settings.showindex === false) {
                        str = str + "<div class='" + this.Colsize[y] + " " + dataclass +  " jdbss-dropdown-index' style='display:none;'>" + value + "</div>";
                    }
                    else if (y === this.settings.valuecolumn && this.settings.valuecolumn > -1) {
                        str = str + "<div class='" + this.Colsize[y] + " " + dataclass +  " jdbss-dropdown-value'>" + value + "</div>";
                    }
                    else {
                        str = str + "<div class='" + this.Colsize[y] + " " + dataclass +  "' >" + value + "</div>";
                    }
                    y = y + 1;
                }

                if (this.settings.valuecolumn === -1) {
                    str = str + "<div class='col jdbss-dropdown-value' style='display:none;'>" + combinedName + "</div>";
                }
                str = str + "</div>";
            }

            //==============================================================================
            //Close out the DIV and wrap up.
            //==============================================================================

            str = str + "</div></div>";
            this.$container.append(str);

        }
    });
    //==============================================================================







    // ******************************************************************************** //
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    // ******************************************************************************** //
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new PlugIn(this, options));
            }
        });
    };
    // ******************************************************************************** //
})(jQuery, window, document);



