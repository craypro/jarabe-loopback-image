const Jimp = require('jimp');
const fileSystem = require('fs');


const defaultSizes = [
    {name: "avatar",    x: 50},
    {name: "thumb",     x: 150},
    {name: "small",     x: 350},
    {name: "medium",    x: 600},
    {name: "big",       x: 1024},
];
var sizesSelected = [];
module.exports = {
    ProcesseImageSizes,
    DeleteFileByUrl
}

async function ProcesseImageSizes(url, type, sizes = defaultSizes) {

    sizesSelected = sizes;
    switch (type) {
        case "resize":
            return await ResizeImages(url);
            break;
        case "delete":
            return await DeleteImages(url);
            break;
    }
}

async function ResizeImages(url, name, x) {
    url = PrepareUrlForServerStorage(url);
    let images = sizesSelected.map(size => url);
    let widths = sizesSelected.map(size => size.x);
    let heights = sizesSelected.map(size => size.y);
    let imagesDestiny = sizesSelected.map(size => PepareUrlWithSufix(url, size.name))
    const options = {
        images,
        imagesDestiny,
        widths,
        heights,
        quality: 90
    };
    let res = await ResizeAndSaveImages(options)
    return res
};

async function DeleteImages(url) {
    let images = sizesSelected.map(size => PepareUrlWithSufix(url, size.name))
    let resdelete = await Promise.all(
        images.map(
            async image => DeleteFileByUrl(image)
        )
    )

};

function PepareUrlWithSufix(url, name) {
    let newUrl = url.split("/").reverse()
    newUrl[0] = `${name}` + newUrl[0];
    newUrl = newUrl.reverse().join("/");
    return newUrl;
}

function PrepareUrlForServerStorage(url) {
    var {
        container,
        filename
    } = ObtainContinerAndNameFromUrl(url);
    url = `server/storage/${container}/${filename}`;
    return url;
}

async function DeleteFileByUrl(url) {
    url = PrepareUrlForServerStorage(url);

    let res = await new Promise(resolve => {
        fileSystem.unlink(url, (err, info) => {
            resolve(info)
        })
    })
};

function ObtainContinerAndNameFromUrl(url) {
    var container = url.split("/")[2];
    var filename = url.split("/")[4];
    return {
        container,
        filename
    };
}

async function ResizeAndSaveImages(options = {}) {
    const defaultOptions = {
        images: [],
        imagesDestiny: [],
        widths: [],
        width: Jimp.AUTO,
        heights: [],
        height: Jimp.AUTO,
        quality: 90
    };
    const opt = {
        ...defaultOptions,
        ...options
    };
    let res = await Promise.all(
        opt.images.map(async (imgPath, index) => {
            const imgPathDestiny = opt.imagesDestiny[index] ? opt.imagesDestiny[index] : imgPath;
            const image = await Jimp.read(imgPath);
            await image.resize(
                opt.widths[index] ? opt.widths[index] : opt.width,
                opt.heights[index] ? opt.heights[index] : opt.height
            );
            await image.quality(opt.quality);
            await image.writeAsync(imgPathDestiny);
        })
    );
    return res
}
