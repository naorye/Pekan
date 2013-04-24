define([
    'base/row-generator',
    'utils'
], function(RowGenerator, Utils) {

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
});