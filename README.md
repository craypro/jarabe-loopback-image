# loopbackImageJarabe
Funciona en un ambiente muy especifico, cuando loopback esta guardando las imagenes con loopback-component-storage y esta en "root": "./server/storage"

## Install
```sh
    npm i jarabe-loopback-image
```

<br>
En uploaded-files.js
## Usage

```js
'use strict';
const jarabeImages = require("jarabe-loopback-image");
const isImage = require('is-image');


module.exports = function (Uploadedfiles) {
    Uploadedfiles.observe('after save', function updateTimestamp(ctx, next) {
        let file = (ctx.instance) ? ctx.instance : ctx.data;

        if (isImage(file.URL)) {
            jarabeImages.ProcesseImageSizes(file.URL, "resize").then((res) => {})
        }
        next();
    });



    Uploadedfiles.observe('before delete', function (ctx, next) {
        Uploadedfiles.deleteFisicalFile(ctx.where.id, next)
    });

    Uploadedfiles.deleteFisicalFile = function (id, next) {
        Uploadedfiles.findById(id, (err, file) => {
            if (!file) return next();
            if (isImage(file.URL)) {
                jarabeImages.ProcesseImageSizes(file.URL, "delete").then((res) => {

                })
            }
            jarabeImages.DeleteFileByUrl(file.URL).then((res) => {

            })
            next();
        })
    }
};

```