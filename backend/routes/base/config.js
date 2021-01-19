var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth){
    
    router.get('/', async function(req, res, next) {
        var q = {};
        const configs = await db.ConfigSchema.find(q);
        res.status(200).json(configs);
    });

    router.post('/', auth.requireAdmin, async function(req, res, next){
        let f = {...req.body};

        let error = false;
        if (!f.key){
            error = "Key is required";
        }else if (!f.value){
            error = "Value is required";
        }

        if (error !== false){
            return res.status(400).json({error: error})
        }
        
        const configSchema = new db.ConfigSchema;
        configSchema.key = f.key;
        configSchema.value = f.value;

        let conf =  await configSchema.save();
    
        res.status(201).json(conf);
    });

    router.get('/:configKey', async function(req, res, next){
        let conf = await db.ConfigSchema.findOne({key: req.params.configKey});
        res.status(200).json(conf);
    });

    router.put('/:configKey', auth.requireAdmin, async function(req, res, next){
        let f = {...req.body};
        let configSchema = await db.ConfigSchema.findOne({key: req.params.configKey});
        if (!configSchema){
            res.status(404).json({error: "No such config"});
        }
        configSchema.value = f.value;
        
        await configSchema.save();

        res.status(200).json(configSchema);
    });

    router.delete('/:configKey', auth.requireAdmin, async function(req, res, next){
        await db.ConfigSchema.deleteOne({key: req.params.configKey});
        res.status(204).send();
    });    

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};