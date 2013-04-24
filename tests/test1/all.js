(function() {
	var var0 = (function () {
	    var RowGenerator = function(container, margin, options) {
	        this.container = container;
	        this.margin = margin;
	        this.options = jQuery.extend({}, this.defaults, options);
	    };
	
	    jQuery.extend(RowGenerator.prototype, {
	        defaults: { },
	        generateGridRowModel: function() {
	            throw "GridRowGenerator is abstract.";
	        },
	        getGenerator: function() {
	            return jQuery.proxy(this.generateGridRowModel, this);
	        },
	        setOption: function(key, value) {
	            this.options[key] = value;
	        },
	        setOptions: function(options) {
	            options = options || {};
	            for (var key in options) {
	                this.setOption(key, options[key]);
	            }
	        }
	    });
	
	    return RowGenerator;
	}).apply(this, []);
	var var1 = (function () {
	    var Utils = {
	        extend: function (base, methods) {
	            var sub = function() {
	                base.apply(this, arguments); // Call base class constructor
	
	                // Call sub class initialize method that will act like a constructor
	                if (this.initialize) {
	                    this.initialize.apply(this, arguments);
	                }
	            };
	            sub.prototype = Object.create(base.prototype);
	            $.extend(sub.prototype, methods);
	            return sub;
	        },
	        parseSize: function (size) {
	            size = parseFloat(size);
	            if (isNaN(size)) {
	                size = null;
	            }
	            return size;
	        }
	    };
	
	    return Utils;
	}).apply(this, []);
	var var2 = (function (RowGenerator, Utils) {
	
	    var IncreasedRowGenerator = Utils.extend(RowGenerator, {
	        defaults: {
	            fitWidthLastRow: false
	        },
	        generateGridRowModel: function(items) {
	            var row = [],
	                len = 0,
	                item = null,
	                i,
	                totalWidth = this.container.width() - 1;
	
	            // Build a row of images until longer than totalWidth
	            while (items.length > 0 &&
	                len + items[0].width + this.options.margin * 2 <= totalWidth) {
	                item = items.shift();
	                row.push(item);
	                len += (item.width + this.options.margin * 2);
	            }
	
	            // In case one image with padding is more then total width, the
	            // first while loop creates an empty row. So we need to reduce the
	            // first image so it will fit the total width
	            if (row.length === 0 && items.length > 0 &&
	                len + items[0].width + this.options.margin * 2 > totalWidth) {
	                item = items.shift();
	
	                var oldWidth = item.width;
	                item.width = totalWidth - this.options.margin * 2;
	                item.height = item.height * item.width / oldWidth;
	
	                row.push(item);
	                len += (item.width + this.options.margin * 2);
	            }
	
	            var fixRowWidth = true;
	
	            // There is no need to fix width of the last row. items.length === 0
	            // indicated this is the last row.
	            if (items.length === 0 && !this.options.fitWidthLastRow) {
	                fixRowWidth = false;
	            }
	
	            var delta = totalWidth - len;
	
	            if (fixRowWidth && row.length > 0 && delta > 0) {
	                var totalRowWidths = 0;
	                for (i = 0; i < row.length; i++) {
	                    totalRowWidths += row[i].width;
	                }
	                var growthRatio = (delta + totalRowWidths) / totalRowWidths,
	                    oldHeight = row[0].height,
	                    newHeight = oldHeight * growthRatio;
	
	                for (i = 0; i < row.length; i++) {
	                    item = row[i];
	                    item.height = item.wrapper_height = newHeight;
	                    item.width = item.wrapper_width = item.width * growthRatio;
	                    item.left_margin = 0;
	                }
	            } else {
	                for (i = 0; i < row.length; i++) {
	                    item = row[i];
	                    item.wrapper_height = item.height;
	                    item.wrapper_width = item.width;
	                    item.left_margin = 0;
	                }
	            }
	
	            return row;
	        }
	    });
	
	    return IncreasedRowGenerator;
	}).apply(this, [var0,var1]);
	var var3 = (function (RowGenerator, Utils) {
	
	    var DecreasedRowGenerator = Utils.extend(RowGenerator, {
	        calculateCutOff: function(len, delta, items) {
	            var cutoff = [],
	                cutsum = 0,
	                i;
	
	            // Distribute the delta based on the proportion of thumbnail size to
	            // length of all thumbnails.
	            for (i in items) {
	                var item = items[i],
	                    fractOfLen = item.width / len;
	                cutoff[i] = Math.floor(fractOfLen * delta);
	                cutsum += cutoff[i];
	            }
	
	            // Still more pixel to distribute because of decimal fractions that were omitted.
	            var stillToCutOff = delta - cutsum;
	            while (stillToCutOff > 0) {
	                for (i = 0; i < cutoff.length && stillToCutOff > 0; i++) {
	                    // distribute pixels evenly until done
	                    cutoff[i]++;
	                    stillToCutOff--;
	                }
	            }
	            return cutoff;
	        },
	        generateGridRowModel: function(items) {
	            var row = [],
	                len = 0,
	                totalWidth = this.container.width() - 1;
	
	            while (items.length > 0 && len < totalWidth) {
	                item = items.shift();
	                row.push(item);
	                len += (item.width + this.options.margin * 2);
	            }
	
	            var delta = len - totalWidth;
	
	            if (row.length > 0 && delta > 0) {
	
	                var cutoff = this.calculateCutOff(len, delta, row);
	
	                for (var i = 0; i < row.length; i++) {
	                    var pixelsToRemove = cutoff[i];
	                    item = row[i];
	
	                    // move the left border inwards by half the pixels
	                    item.left_margin = Math.floor(pixelsToRemove / 2);
	
	                    // shrink the width of the image by pixelsToRemove
	                    item.wrapper_width = item.width - pixelsToRemove;
	                    item.wrapper_height = item.height;
	                }
	            } else {
	                // all images fit in the row, set x and viewWidth
	                for(var j in row) {
	                    item = row[j];
	                    item.left_margin = 0;
	                    item.wrapper_width = item.width;
	                    item.wrapper_height = item.height;
	                }
	            }
	
	            return row;
	        }
	    });
	
	    return DecreasedRowGenerator;
	}).apply(this, [var0,var1]);
	var var4 = (function (IncreasedRowGenerator, DecreasedRowGenerator, Utils) {
	
	    var PhotosGrid = function (container, options) {
	        this.originalClass = container.attr("class");
	        this.container = container.addClass("photos-grid");
	        this.windowResizeHandler = jQuery.proxy(this.windowResizeHandler, this);
	        this.launchProcess(options);
	    };
	    jQuery.extend(PhotosGrid.prototype, {
	        defaults: {
	            url: null,
	            data: null,
	            dataFetcher: null,
	            data_photoUrl: "url",
	            data_height: "height",
	            data_width: "width",
	            data_href: "href",
	            mode: "decrease",
	            maxWidth: null,
	            margin: 3,
	            handleWindowResize: true,
	            photoClickCallback: null,
	
	            // IncreasedGridRowGenerator options 
	            fitWidthLastRow: false
	        },
	        launchProcess: function(options) {
	            var oldOptions = this.options,
	                dataRelatedOptionsChanged = false;
	
	            options = options || {};
	            this.options = jQuery.extend({}, this.defaults, this.options, options);
	
	            for (var key in this.options) {
	                var oldValue = oldOptions && oldOptions[key],
	                    newValue = this.options[key];
	                if (oldValue !== newValue) {
	                    switch (key) {
	                        case 'margin':
	                            this.margin = Utils.parseSize(newValue);
	                            this.rowGenerator.setOption('margin', this.margin);
	                            break;
	                        case 'maxWidth':
	                            this.setMaxWidth(newValue);
	                            break;
	                        case 'mode':
	                            this.setMode(newValue);
	                            break;
	                        case 'handleWindowResize':
	                            // Using !oldValue instead of '=== false' because
	                            // when initialize the oldValue is undefined
	                            if (!oldValue && newValue === true) {
	                                //listen to window resize
	                                this.resizeTimeoutId = null;
	                                jQuery(window).resize(this.windowResizeHandler);
	                            } else if (oldValue === true && newValue === false) {
	                                //stop listenning to window resize
	                                if (this.resizeTimeoutId !== null) {
	                                    clearTimeout(this.resizeTimeoutId);
	                                    this.resizeTimeoutId = null;
	                                }
	                                jQuery(window).unbind('resize', this.windowResizeHandler);
	                            }
	                            break;
	                        case 'photoClickCallback':
	                            // Do nothing since renderPhoto unbind and bind
	                            // the new click callback
	                            break;
	                        case 'fitWidthLastRow':
	                            this.rowGenerator.setOption('fitWidthLastRow', newValue);
	                            break;
	                        case 'url':
	                        case 'data':
	                        case 'dataFetcher':
	                        case 'data_photoUrl':
	                        case 'data_height':
	                        case 'data_width':
	                        case 'data_href':
	                            dataRelatedOptionsChanged = true;
	                            break;
	                    }
	                }
	            }
	
	            if (dataRelatedOptionsChanged) {
	                this.fetchData(this.renderGrid, this);
	            } else {
	                this.renderGrid();
	            }
	        },
	        windowResizeHandler: function() {
	            if (this.resizeTimeoutId !== null) {
	                clearTimeout(this.resizeTimeoutId);
	            }
	            var scope = this;
	            this.resizeTimeoutId = setTimeout(function() {
	                scope.renderGrid();
	                scope.resizeTimeoutId = null;
	            }, 200);
	        },
	        setMaxWidth: function(maxWidth) {
	            maxWidth = Utils.parseSize(maxWidth);
	            if (maxWidth) {
	                this.container.css('max-width', maxWidth);
	            } else {
	                this.container.css("max-width", "");
	            }
	        },
	        setMode: function(mode) {
	            mode = mode && mode.toLowerCase();
	            this.generateGridRowModel = null;
	            switch(mode) {
	                case "increase":
	                    this.rowGenerator = new IncreasedRowGenerator(this.container, this.margin, this.options);
	                    this.generateGridRowModel = this.rowGenerator.getGenerator();
	                    break;
	                case "decrease":
	                    this.rowGenerator = new DecreasedRowGenerator(this.container, this.margin, this.options);
	                    this.generateGridRowModel = this.rowGenerator.getGenerator();
	                    break;
	                default:
	                    throw mode + " is not a valid mode. use increase / decrease only.";
	            }
	        },
	        setOption: function(key, value) {
	            var options = {};
	            options[key] = value;
	            this.setOptions(options);
	        },
	        setOptions: function(options) {
	            this.launchProcess(options);
	        },
	        fetchData: function(callback, context) {
	            var _callback = jQuery.proxy(function(items) {
	                this.items = items;
	                this.internalItems = null;
	
	                callback.call(context);
	            }, this);
	            if (this.options.data) {
	                _callback(this.options.data);
	            } else if (this.options.url) {
	                jQuery.getJSON(this.options.url, _callback);
	            } else if (this.options.dataFetcher &&
	                typeof this.options.dataFetcher === "function") {
	                this.options.dataFetcher(_callback);
	            }
	        },
	        createItemsCopy: function() {
	            var i;
	            if (!this.internalItems) {
	                this.internalItems = [];
	                for (i = 0; i < this.items.length; i++) {
	                    this.internalItems.push({
	                        url: this.items[i][this.options.data_photoUrl],
	                        width: this.items[i][this.options.data_width],
	                        height: this.items[i][this.options.data_height],
	                        href: this.items[i][this.options.data_href],
	                        originalItem: this.items[i]
	                    });
	                }
	            } else {
	                for (i = 0; i < this.internalItems.length; i++) {
	                    jQuery.extend(this.internalItems[i], this.internalItems[i].originalItem);
	                }
	            }
	            // Returns copy of the internal items array
	            return this.internalItems.slice(0);
	        },
	        generateGridModel: function() {
	            var itemsCopy = this.createItemsCopy();
	            var rows = [],
	                lastItemsLength = -1;
	            // We have to validate that the array's length has changed each iteration
	            // to prevent endless loop.
	            while (itemsCopy.length > 0 && itemsCopy.length != lastItemsLength) {
	                lastItemsLength = itemsCopy.length;
	                var row = this.generateGridRowModel(itemsCopy);
	                rows.push(row);
	            }
	
	            return rows;
	        },
	        renderPhoto: function(photo) {
	            if (!photo) { return; }
	            if (!photo.photoElem) {
	
	                var photoStructure =
	                    "<div class='photo-container'>" +
	                        "<div class='photo-wrapper'>" +
	                            "<a class='photo-anchor'>" +
	                                "<img src='" + photo.url +"' /></a>" +
	                        "</div>" +
	                    "</div>";
	
	                photo.photoElem = jQuery(photoStructure);
	            }
	
	            photo.photoElem
	                .css({ margin: this.margin + "px" });
	
	            photo.photoElem.find(".photo-wrapper").css({
	                width: (photo.wrapper_width || 120) + "px",
	                height: (photo.wrapper_height || 120) + "px"
	            });
	
	            /* jshint scripturl:true */
	            var href = photo.href ? photo.href : "javascript:void(0);";
	            photo.photoElem.find(".photo-anchor")
	                .attr("href", href)
	                .unbind('click')
	                .click(jQuery.proxy(function() {
	                    var photoClickCallback = this.options.photoClickCallback,
	                        container = this.container;
	                    if (photoClickCallback &&
	                        typeof photoClickCallback === "function") {
	                        photoClickCallback(photo.originalItem, photo.photoElem);
	                    }
	                    container.trigger("photo-click", photo.originalItem);
	                }, this));
	
	            photo.photoElem.find("img")
	                .css({
	                    width: (photo.width || 120) + "px",
	                    height: (photo.height || 120) + "px",
	                    "margin-left": (photo.left_margin ? -photo.left_margin : 0) +"px"
	                });
	
	            return photo.photoElem;
	        },
	        renderGrid: function() {
	            //this.container.empty();
	
	            var gridModel = this.generateGridModel();
	
	            var clearfix = this.container.find('.clearfix');
	            if (clearfix.length === 0) {
	                clearfix= jQuery("<div class='clearfix'></div>")
	                    .appendTo(this.container);
	            }
	
	            for(var rowIndex in gridModel) {
	                for(var photoIndex in gridModel[rowIndex]) {
	                    var photo = gridModel[rowIndex][photoIndex];
	                    if (!photo.photoElem) {
	                        this.renderPhoto(photo).insertBefore(clearfix);
	                    } else {
	                        this.renderPhoto(photo);
	                    }
	                }
	            }
	        },
	        destroy: function() {
	            jQuery(window).unbind('resize', this.windowResizeHandler);
	            this.container.find('.photo-anchor').unbind('click');
	            this.container
	                .removeClass('photos-grid')
	                .empty()
	                .addClass(this.originalClass);
	        }
	    });
	
	    return PhotosGrid;
	}).apply(this, [var2,var3,var1]);
	var var5 = (function (PhotosGrid) {
	    jQuery.fn.photosGrid = function(options) {
	        var photosGrid = new PhotosGrid(this, options);
	        this.data('photosGrid', photosGrid);
	        return this;
	    };
	}).apply(this, [var4]);
})();