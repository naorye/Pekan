define([
    'base/row-generator',
    'utils'
], function(RowGenerator, Utils) {

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
});