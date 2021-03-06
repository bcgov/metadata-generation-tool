var express = require('express');
var path = require('path');


let forumRouter = express.Router();
let forumBridge = require('./forumApi/bridge');
forumRouter = forumBridge(forumRouter);

let formioRouter = express.Router();
let formioBridge = require('./formio/bridge');
formioRouter = formioBridge(formioRouter);

let db = require('../../db/db');

let auth = require('../../modules/auth');

const { Router } = require('express');

module.exports = (router, cache) => {

    //api spec
    router.use('/spec', express.static(path.join(__dirname, 'spec')));

    //api docs
    router.use('/api-docs', function(req, res){
        var docs = require('./docs/docs');
        res.send(docs.getDocHTML("v1"));
    });

    router.use('/forum', auth.requireLoggedIn, forumRouter);
    router.use('/formio', auth.requireLoggedIn, formioRouter);

    router.use('/token', function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            res.json(req.user);
        }else{
            res.json({error: "Not logged in"});
        }
    });

    var forumClient = require('./clients/forum_client');
    var formioClient = require('./clients/formio_client');
    var revisionService = require('./services/revisionService');
    var notify = require('./notify/notify')(db);

    var configRoutes = require('../base/config');
    var cfRouter = new Router();
    cfRouter = configRoutes.buildStatic(db, cfRouter);
    cfRouter = configRoutes.buildDynamic(db, cfRouter, auth, cache);
    router.use('/config', auth.requireLoggedIn, cfRouter);

    var packageRoutes = require('../base/packages');
    var pRouter = new Router();

    let ValidationError = require('../../modules/validationError');
    pRouter = packageRoutes.buildStatic(db, pRouter);
    pRouter = packageRoutes.buildDynamic(db, pRouter, auth, ValidationError, cache);
    router.use('/datapackages', auth.requireLoggedIn, pRouter);

    var dataUploadRoutes = require('../base/uploads');
    var uRouter = new Router();
    uRouter = dataUploadRoutes.buildStatic(db, uRouter);
    uRouter = dataUploadRoutes.buildDynamic(db, uRouter, auth, forumClient, notify, revisionService);
    router.use('/datauploads', auth.requireLoggedIn, uRouter);

    var dataProviderRoutes = require('../base/providers');
    var dpRouter = new Router();
    dpRouter = dataProviderRoutes.buildStatic(db, dpRouter);
    dpRouter = dataProviderRoutes.buildDynamic(db, dpRouter, auth, forumClient);
    router.use('/dataproviders', auth.requireLoggedIn, dpRouter);

    var repositoriesRoutes = require('../base/repo');
    var repoRouter = new Router();
    repoRouter = repositoriesRoutes.buildStatic(db, repoRouter);
    repoRouter = repositoriesRoutes.buildDynamic(db, repoRouter, auth, forumClient, cache);
    router.use('/repos', auth.requireLoggedIn, repoRouter);

    var repoBranchesRoutes = require('../base/branches');
    var branchRouter = new Router();
    branchRouter = repoBranchesRoutes.buildStatic(db, branchRouter);
    branchRouter = repoBranchesRoutes.buildDynamic(db, branchRouter, auth, revisionService, cache);
    router.use('/repobranches', auth.requireLoggedIn, branchRouter);

    var tableSchemasRoutes = require('../base/tableSchema');
    var tableRouter = new Router();
    tableRouter = repoBranchesRoutes.buildStatic(db, tableRouter);
    tableRouter = repoBranchesRoutes.buildDynamic(db, tableRouter, auth, cache);
    router.use('/tableschemas', auth.requireLoggedIn, tableRouter);

    return router;
}
