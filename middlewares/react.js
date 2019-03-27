const { resolve } = require('path');
const fs = require('fs');
const reactRender = require('../common/react-render');

const readFile = async (path) => {
    try {
        let buffer = await fs.readFileSync(path);
        return buffer.toString('utf8');
    } catch (e) {
        return '';
    }
};

const getVersionInfo = async (folderName) => {
    let json = { view: '', degrade: '', bundle: '', manifest: '' };
    let viewPath = resolve(__dirname, `../WEB_STATIC/${folderName}/${folderName}.template.html`);
    const viewContent = await readFile(viewPath);
    if (viewContent) json.view = viewContent;
    let degradePath = resolve(__dirname, `../WEB_STATIC/${folderName}/${folderName}.degrade.html`);
    const degradeContent = await readFile(degradePath);
    if (degradeContent) json.degrade = degradeContent;
    let bundlePath = resolve(__dirname, `../WEB_STATIC/${folderName}/${folderName}.server.json`);
    const bundleContent = await readFile(bundlePath);
    if (bundleContent) json.bundle = bundleContent;
    let manifestPath = resolve(__dirname, `../WEB_STATIC/${folderName}/${folderName}.client.json`);
    const manifestContent = await readFile(manifestPath);
    if (manifestContent) json.manifest = manifestContent;
    return json;
};

module.exports = async function(app, options) {
    const initVersions = async function () {
        let vers = {};
        try {
            const staticPath = resolve(__dirname, '../WEB_STATIC');
            const files = await fs.readdirSync(staticPath);
            files.forEach(async name => {
                const version = await getVersionInfo(name);
                vers[name] = version;
            });
            app.context.versions = vers;
        } catch (e) {
            app.context.versions = {};
        }
    };
    app.context.initVersions = initVersions;
    app.context.getResource = async function(appName) {
        let ctx = this;
        let ver = ctx.versions && ctx.versions[appName] || {};
        return ver;
    };
    app.context.reactRenderToString = async function(appName, _context) {
        const ctx = this;
        const context = Object.assign({}, ctx.state, _context);
        const ver = ctx.getResource(appName);
        const option = {
            appName,
            context,
            manifest: ver.manifest,
            bundle: ver.bundle,
            view: ver.view,
            cacheBundle: false,
            inject: context.inject !== false ? true : false,
            shouldPreload: context.shouldPreload
        };
        let str = await reactRender(option);
        ctx._context = context
        return str;
    };
    app.context.react = async function(appName, _context) {
        const ctx = this;
        if (_context.degrade) {
            let ver = await ctx.getResource(appName);
            if (ver.degrade) {
                ctx.body = ver.degrade;
            } else {
                ctx.status = 404;
                ctx.body = 'Not Found';
            }
        } else {
            ctx.body = await ctx.reactRenderToString(appName, _context);
        }
    };
    await initVersions();
};