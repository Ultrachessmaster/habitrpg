// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var algos = require('habitrpg-shared/script/algos');
var helpers = require('habitrpg-shared/script/helpers');
var items = require('habitrpg-shared/script/items');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var api = module.exports;

/*
  ------------------------------------------------------------------------
  Groups
  ------------------------------------------------------------------------
*/

/**
 * Get groups. If req.query.type privided, returned as an array (so ngResource can use). If not, returned as
 * object {guilds, public, party, tavern}. req.query.type can be comma-separated `type=guilds,party`
 * @param req
 * @param res
 * @param next
 */
api.getGroups = function(req, res, next) {
  var user = res.locals.user;
  var usernameFields = 'auth.local.username auth.facebook.displayName auth.facebook.givenName auth.facebook.familyName auth.facebook.name';
  var type = req.query.type && req.query.type.split(',');

  // First get all groups
  async.parallel({
    party: function(cb) {
      if (type && !~type.indexOf('party')) return cb(null, {});
      Group
        .findOne({type: 'party', members: {'$in': [user._id]}})
        .populate({
          path: 'members',
          //match: {_id: {$ne: user._id}}, //fixme this causes it to hang??
          select: 'profile preferences items stats achievements party backer ' + usernameFields
        })
        .exec(cb);
    },
    guilds: function(cb) {
      if (type && !~type.indexOf('guilds')) return cb(null, []);
      Group.find({type: 'guild', members: {'$in': [user._id]}}).populate('members', usernameFields).exec(cb);
//      Group.find({type: 'guild', members: {'$in': [user._id]}}, cb);
    },
    tavern: function(cb) {
      if (type && !~type.indexOf('tavern')) return cb(null, {});
      Group.findOne({_id: 'habitrpg'}, cb);
    },
    "public": function(cb) {
      if (type && !~type.indexOf('public')) return cb(null, []);
      Group.find({privacy: 'public'}, {name:1, description:1, members:1}, cb);
    }
  }, function(err, results){
    if (err) return res.json(500, {err: err});

    // Remove self from party (see above failing `match` directive in `populate`
    var i = _.findIndex(results.party.members, {_id:user._id});
    if (~i) results.party.members.splice(i,1);

    // Sort public groups by members length (not easily doable in mongoose)
    results.public = _.sortBy(results.public, function(group){
      return -group.members.length;
    });

    // If they're requesting a specific type, let's return it as an array so that $ngResource
    // can utilize it properly
    if (type) {
      results = _.reduce(type, function(m,t){
        return m.concat(_.isArray(results[t]) ? results[t] : [results[t]]);
      }, []);
    }

    res.json(results);
  })
};

api.attachGroup = function(req, res, next) {
  Group.findById(req.params.gid, function(err, group){
    if(err) return res.json(500, {err:err});
    res.locals.group = group;
    next();
  })
}

api.postChat = function(req, res, next) {
  var user = res.locals.user
  var group = res.locals.group;
  var message = {
    id: helpers.uuid(),
    uuid: user._id,
    contributor: user.backer && user.backer.contributor,
    npc: user.backer && user.backer.npc,
    text: req.query.message, // FIXME this should be body, but ngResource is funky
    user: helpers.username(user.auth, user.profile.name),
    timestamp: +(new Date)
  };

  group.chat.unshift(message);
  group.chat.splice(200);

  if (group.type === 'party') {
    user.party.lastMessageSeen = message.id;
    user.save();
  }

  group.save(function(err, saved){
    if (err) return res.json(500, {err:err});
    res.json(saved);
  })
}

api.join = function(req, res, next) {
  var user = res.locals.user,
    group = res.locals.group;

  group.members.push(user._id);
  group.save(function(err, saved){
    if (err) return res.json(500,{err:err});
    res.json(saved);
  });

  if (group.type == 'party' && group._id == (user.invitations && user.invitations.party && user.invitations.party.id)) {
    user.invitations.party = undefined;
    user.save();
  }
  else if (group.type == 'guild' && user.invitations && user.invitations.guilds) {
    var i = _.findIndex(user.invitations.guilds, {id:group._id});
    if (~i) user.invitations.guilds.splice(i,1);
    user.save();
  }
}

api.leave = function(req, res, next) {
  var user = res.locals.user,
    group = res.locals.group;

  Group.update({_id:group._id},{$pull:{members:user._id}}, function(err, saved){
    if (err) return res.json(500,{err:err});
    res.send(200, saved);
  })
}

api.invite = function(req, res, next) {
  var group = res.locals.group;
  var uuid = req.query.uuid;

  User.findById(uuid, function(err,invite){
    if (err) return res.json(500,{err:err});
    if (!invite)
       return res.json(400,{err:'User with id '+req.query.uid+' not found'});
    if (group.type == 'guild') {
      if (_.contains(group.members,uuid))
        return res.json(400,{err: "User already in that group"});
      if (invite.invitations && invite.invitations.guilds && _.find(invite.invitations.guilds, {id:group._id}))
        return res.json(400, {err:"User already invited to that group"});
      sendInvite();
    } else if (group.type == 'party') {
      if (invite.invitations && invite.invitations.party)
        return res.json(400,{err:"User already pending invitation."});
      Group.find({type:'party', members:{$in:[uuid]}}, function(err, groups){
        if (err) return res.json(500,{err:err});
        if (!_.isEmpty(groups))
          return res.json(400,{err:"User already in a party."})
        sendInvite();
      })
    }

    function sendInvite (){
      //req.body.type in 'guild', 'party'
      invite.invitations.party = {id:group._id, name: group.name}
      invite.save();
      res.json(group);
    }
  });
}