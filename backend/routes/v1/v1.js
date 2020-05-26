var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('config');

let forumRouter = express.Router();
let forumBridge = require('./forumApi/bridge');
forumRouter = forumBridge(forumRouter);

let formioRouter = express.Router();
let formioBridge = require('./formio/bridge');
formioRouter = formioBridge(formioRouter);

let dataUploadRoutes = require('./dataUploads/routes');
let dataPackagesRoutes = require('./dataPackages/routes');
let tableSchemasRoutes = require('./tableSchemas/routes');
let repositoriesRoutes = require('./repositories/routes');
let repoBranchesRoutes = require('./repoBranches/routes');

//api spec
router.use('/spec', express.static(path.join(__dirname, 'spec')));

//api docs
router.use('/api-docs/', function(req, res){
    var docs = require('./docs/docs');
    res.send(docs.getDocHTML("v1"));
});

const swaggerUi = require('swagger-ui-express');
var Converter = require('api-spec-converter');
let openapiFile = path.join(__dirname, 'spec') + "/api-docs.yaml";

// router.get('/swagger', (req, res, next) => {
//     Converter.convert({
//         from: 'openapi_3',
//         to: 'swagger_2',
//         source: openapiFile,
//       }, function(err, converted) {
//         console.log(converted.stringify());
//         res.status(200).json(JSON.parse(converted.stringify()));
//       });
// });

var options = {
    explorer: true,
    oauth2RedirectUrl: '/api/v1/swag-docs/callback',
    };

Converter.convert({
    from: 'openapi_3',
    to: 'swagger_2',
    source: openapiFile,
}, function(err, converted) {
    let swaggerDocument = JSON.parse(converted.stringify())

    swaggerDocument.securityDefinitions.api_auth.tokenUrl = config.get("oidc.tokenURL")
    swaggerDocument.securityDefinitions.api_auth.authorizationUrl = config.get("oidc.authorizationURL")

    
    console.log("Registered /swag-docs");
    router.use('/swag-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
})

router.use('/datauploads', dataUploadRoutes(express.Router()));
router.use('/datapackages', dataPackagesRoutes(express.Router()));
router.use('/tableschemas', tableSchemasRoutes(express.Router()));
router.use('/forum', forumRouter);
router.use('/formio', formioRouter);

router.use('/repos', repositoriesRoutes(express.Router()));
router.use('/repobranches', repoBranchesRoutes(express.Router()));

module.exports = router;