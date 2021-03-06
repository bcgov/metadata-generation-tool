var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth, forumClient, cache){
    const log = require('npmlog');
    const mongoose = require('mongoose');

    const util = require('./util');
    const requiredPhase = 2

    const createRepo = async function(user, name) {
        const id = mongoose.Types.ObjectId();
        const topic = await forumClient.addTopic(id, user);
        const repoSchema = new db.RepoSchema;
        repoSchema._id = id;
        repoSchema.name = name;
        repoSchema.create_date = new Date();
        repoSchema.created_by = user.id;
        repoSchema.topic_id = topic._id;
    
        return await repoSchema.save();
    }
    
    const updateRepo = async function(user, id, body) {
        //check topic exists this checks for user permissions
        const response = await forumClient.getTopic(user, id);
        const fields = {...body};
        var record = {};
        try{
            record = await db.RepoSchema.findOne({_id: mongoose.Types.ObjectId(id)});
        }catch(ex){
            //record doesn't exist
            log.error(ex);
            throw new Error(ex.message);
        }
    
        //record exists
        if (fields.name){
            record.name = fields.name;
        }
    
        return await record.save();
    }
    
    const listRepositories = async (user, query) => {
        try {
            const topicResponse = await forumClient.getTopics(user, query);
            topics = topicResponse.data.filter(item => item.parent_id);
            const repoIds = topics.map(item => item.name);
            if(query && query.upload_id) {
                //return await db.RepoSchema.find({data_upload_id: mongoose.Types.ObjectId(query.filterBy)}).sort({ "create_date": 1});
                return await db.RepoBranchSchema.find({data_upload_id: query.upload_id}).populate('repo_id');
                //return await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": 1});
            }else{
                return await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": 1});
            }
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    router.get('/', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('GET', 'repos'));
        }
        let repos = await listRepositories(req.user, req.query);
        res.status(200).json(repos);
    });

    router.post('/', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('POST', 'repos'));
        }
        let fields = {...req.body};

        if (!fields.name){
            return res.status(400).json({error: "Name is required"});
        }
    
        try{
            const repo = await createRepo(req.user, fields.name);
            res.status(201).json({id: repo._id.toString()});
        }catch(ex){
            res.status(500).json({error: "Unknown error"});
        }
    });

    router.put('/:repoId', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('PUT', ('repos/'+req.params.repoId)));
        }
        const repo = await updateRepo(req.user, req.params.repoId, req.body);
        res.status(200).json(repo);
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};