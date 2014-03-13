require("famous/polyfills");

var Engine             = require("famous/engine");
var Surface            = require("famous/surface");
var HeaderFooterLayout = require("famous/views/header-footer-layout");

var mainCtx = Engine.createContext();

var layout = new HeaderFooterLayout({
    headerSize: 100,
    footerSize: 50
});

layout.id["header"].add(new Surface({
    size: [undefined, undefined],
    content: "Header",
    properties: {
    }
}));

layout.id["content"].add(new Surface({
    size: [undefined, undefined],
    content: "Content",
    properties: {
    }
}));

layout.id["footer"].add(new Surface({
    size: [undefined, undefined],
    content: "Footer",
    properties: {
    }
}));

mainCtx.add(layout);
