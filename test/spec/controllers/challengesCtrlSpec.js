'use strict';

describe('Challenges Controller', function() {
  var $rootScope, scope, user, User, ctrl, groups, notification, state;

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      user._id = "unique-user-id";
      User = {
        getBalanceInGems: sandbox.stub(),
        sync: sandbox.stub(),
        user: user
      }
      $provide.value('User', User);
    });

    inject(function($rootScope, $controller, _$state_, _Groups_, _Notification_){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: User});

      ctrl = $controller('ChallengesCtrl', {$scope: scope, User: User});

      groups = _Groups_;
      notification = _Notification_;
      state = _$state_;
    });
  });

  context('filtering', function() {
    describe('filterChallenges', function() {
      var ownMem, ownNotMem, notOwnMem, notOwnNotMem;

      beforeEach(function() {
        ownMem = specHelper.newChallenge({
          description: 'You are the owner and member',
          leader: user._id,
          members: [user],
          _isMember: true
        });

        ownNotMem = specHelper.newChallenge({
          description: 'You are the owner, but not a member',
          leader: user._id,
          members: [],
          _isMember: false
        });

        notOwnMem = specHelper.newChallenge({
          description: 'Not owner but a member',
          leader: {_id:"test"},
          members: [user],
          _isMember: true
        });

        notOwnNotMem = specHelper.newChallenge({
          description: 'Not owner or member',
          leader: {_id:"test"},
          members: [],
          _isMember: false
        });

        scope.search = {
          group: _.transform(groups, function(m,g){m[g._id]=true;})
        };
      });

      it('displays challenges that match membership: either and owner: either', function() {
        scope.search._isMember = 'either';
        scope.search._isOwner = 'either';
        expect(scope.filterChallenges(ownMem)).to.eql(true);
        expect(scope.filterChallenges(ownNotMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
      });

      it('displays challenges that match membership: either and owner: true', function() {
        scope.search._isMember = 'either';
        scope.search._isOwner = true;
        expect(scope.filterChallenges(ownMem)).to.eql(true);
        expect(scope.filterChallenges(ownNotMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
      });

      it('displays challenges that match membership: either and owner: false', function() {
        scope.search._isMember = 'either';
        scope.search._isOwner = false;
        expect(scope.filterChallenges(ownMem)).to.eql(false);
        expect(scope.filterChallenges(ownNotMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
      });

      it('displays challenges that match membership: true and owner: either', function() {
        scope.search._isMember = true;
        scope.search._isOwner = 'either';
        expect(scope.filterChallenges(ownMem)).to.eql(true);
        expect(scope.filterChallenges(ownNotMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
      });

      it('displays challenges that match membership: true and owner: true', function() {
        scope.search._isMember = true;
        scope.search._isOwner = true;
        expect(scope.filterChallenges(ownMem)).to.eql(true);
        expect(scope.filterChallenges(ownNotMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
      });

      it('displays challenges that match membership: true and owner: false', function() {
        scope.search._isMember = true;
        scope.search._isOwner = false;
        expect(scope.filterChallenges(ownMem)).to.eql(false);
        expect(scope.filterChallenges(ownNotMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
      });

      it('displays challenges that match membership: false and owner: either', function() {
        scope.search._isMember = false;
        scope.search._isOwner = 'either';
        expect(scope.filterChallenges(ownMem)).to.eql(false);
        expect(scope.filterChallenges(ownNotMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
      });

      it('displays challenges that match membership: false and owner: true', function() {
        scope.search._isMember = false;
        scope.search._isOwner = true;
        expect(scope.filterChallenges(ownMem)).to.eql(false);
        expect(scope.filterChallenges(ownNotMem)).to.eql(true);
        expect(scope.filterChallenges(notOwnMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
      });

      it('displays challenges that match membership: false and owner: false', function() {
        scope.search._isMember = false;
        scope.search._isOwner = false;
        expect(scope.filterChallenges(ownMem)).to.eql(false);
        expect(scope.filterChallenges(ownNotMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnMem)).to.eql(false);
        expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
      });
    });

    describe('selectAll', function() {
      it('selects all groups');
    });

    describe('selectNone', function() {
      it('selects no groups');
    });
  });

  context('task manipulation', function() {

    describe('shouldShow', function() {
      it('overrides task controller function by always returning true', function() {
        expect(scope.shouldShow()).to.eq(true);
      });
    });

    describe('edit', function() {
      it('transitions to edit page');
    });

    describe('addTask', function() {
      it('adds default task to array');
      it('removes text from new task input box');
    });

    describe('editTask', function() {
      it('is Tasks.editTask', function() {
        inject(function(Tasks) {
          expect(scope.editTask).to.eql(Tasks.editTask);
        });
      });
    });

    describe('removeTask', function() {
      it('asks user to confirm deletion');
      it('removes task from list');
    });

    describe('saveTask', function() {
      it('sets task._editing to false');
    });
  });

  context('challenge owner interactions', function() {
    describe("save challenge", function() {
      var alert;

      beforeEach(function(){
        alert = sandbox.stub(window, "alert");
      });

      it("opens an alert box if challenge.group is not specified", function()
        {
        var challenge = specHelper.newChallenge({
          name: 'Challenge without a group',
          group: null
        });

        scope.save(challenge);

        expect(alert).to.be.calledOnce;
        expect(alert).to.be.calledWith(window.env.t('selectGroup'));
      });

      it("opens an alert box if isNew and user does not have enough gems", function() {
        var challenge = specHelper.newChallenge({
          name: 'Challenge without enough gems',
          prize: 5
        });

        scope.maxPrize = 4;
        scope.save(challenge);

        expect(alert).to.be.calledOnce;
        expect(alert).to.be.calledWith(window.env.t('challengeNotEnoughGems'));
      });

      it("saves the challenge if user does not have enough gems, but the challenge is not new", function() {
        var challenge = specHelper.newChallenge({
          _id: 'challenge-has-id-so-its-not-new',
          name: 'Challenge without enough gems',
          prize: 5,
          $save: sandbox.spy() // stub $save
        });

        scope.maxPrize = 0;
        scope.save(challenge);

        expect(challenge.$save).to.be.calledOnce;
        expect(alert).to.not.be.called;
      });

      it("saves the challenge if user has enough gems and challenge is new", function() {
        var challenge = specHelper.newChallenge({
          name: 'Challenge without enough gems',
          prize: 5,
          $save: sandbox.spy() // stub $save
        });

        scope.maxPrize = 5;
        scope.save(challenge);

        expect(challenge.$save).to.be.calledOnce;
        expect(alert).to.not.be.called;
      });

      it('saves challenge and then proceeds to detail page', function() {
        var saveSpy = sandbox.stub();
        saveSpy.yields({_id: 'challenge-id'});
        sandbox.stub(state, 'transitionTo');

        var challenge = specHelper.newChallenge({
          $save: saveSpy // stub $save
        });

        scope.save(challenge);

        expect(state.transitionTo).to.be.calledOnce;
        expect(state.transitionTo).to.be.calledWith(
         'options.social.challenges.detail',
         { cid: 'challenge-id' },
         {
            reload: true, inherit: false, notify: true
          }
        );
      });

      it('saves new challenge and syncs User', function() {
        var saveSpy = sandbox.stub();
        saveSpy.yields({_id: 'new-challenge'});

        var challenge = specHelper.newChallenge({
          $save: saveSpy // stub $save
        });

        scope.save(challenge);

        expect(User.sync).to.be.calledOnce;
      });

      it('saves new challenge and syncs User', function() {
        var saveSpy = sandbox.stub();
        saveSpy.yields({_id: 'new-challenge'});
        sinon.stub(notification, 'text');

        var challenge = specHelper.newChallenge({
          $save: saveSpy // stub $save
        });

        scope.save(challenge);

        expect(notification.text).to.be.calledOnce;
        expect(notification.text).to.be.calledWith(window.env.t('challengeCreated'));
      });
    });

    describe('create', function() {
      it('creates new challenge with group that user has selected in filter');

      it('defaults to tavern if no group can be set as default');

      it('calculates maxPrize');

      it('sets newChallenge to a blank challenge');

      context('tavern challenge', function() {
        it('sets isTavernChallengeAndUserCannotProvidePrize to false if user has no gems');
        it('sets isTavernChallengeAndUserCannotProvidePrize to true if user has at least one gem');
      });

      context('non-tavern challenge', function() {
        it('sets isTavernChallengeAndUserCannotProvidePrize to false');
      });
    });

    describe('discard', function() {
      it('sets new challenge to null');
    });

    describe('clone', function() {

      var challengeToClone = {
        name: 'copyChallenge',
        description: 'copyChallenge',
        habits: [specHelper.newHabit()],
        dailys: [specHelper.newDaily()],
        todos: [specHelper.newTodo()],
        rewards: [specHelper.newReward()],
        leader: 'unique-user-id',
        group: { _id: "copyGroup" },
        timestamp: new Date("October 13, 2014 11:13:00"),
        members: ['id', 'another-id'],
        official: true,
        _isMember: true,
        prize: 1
      };

      it('Clones the basic challenge info', function() {

        scope.clone(challengeToClone);

        expect(scope.newChallenge.name).to.eql(challengeToClone.name);
        expect(scope.newChallenge.shortName).to.eql(challengeToClone.shortName);
        expect(scope.newChallenge.description).to.eql(challengeToClone.description);
        expect(scope.newChallenge.leader).to.eql(user._id);
        expect(scope.newChallenge.group).to.eql(challengeToClone.group._id);
        expect(scope.newChallenge.official).to.eql(challengeToClone.official);
        expect(scope.newChallenge.prize).to.eql(challengeToClone.prize);
      });

      it('does not clone members', function() {
        scope.clone(challengeToClone);

        expect(scope.newChallenge.members).to.not.exist;
      });

      it('does not clone timestamp', function() {
        scope.clone(challengeToClone);

        expect(scope.newChallenge.timestamp).to.not.exist;
      });

      it('clones habits', function() {
        scope.clone(challengeToClone);

        expect(scope.newChallenge.habits.length).to.eql(challengeToClone.habits.length);
        expect(scope.newChallenge.habits[0].text).to.eql(challengeToClone.habits[0].text);
        expect(scope.newChallenge.habits[0].notes).to.eql(challengeToClone.habits[0].notes);
      });

      it('clones dailys', function() {
        scope.clone(challengeToClone);

        expect(scope.newChallenge.dailys.length).to.eql(challengeToClone.dailys.length);
        expect(scope.newChallenge.dailys[0].text).to.eql(challengeToClone.dailys[0].text);
        expect(scope.newChallenge.dailys[0].notes).to.eql(challengeToClone.dailys[0].notes);
      });

      it('clones todos', function() {
        scope.clone(challengeToClone);

        expect(scope.newChallenge.todos.length).to.eql(challengeToClone.todos.length);
        expect(scope.newChallenge.todos[0].text).to.eql(challengeToClone.todos[0].text);
        expect(scope.newChallenge.todos[0].notes).to.eql(challengeToClone.todos[0].notes);
      });

      it('clones rewards', function() {
        scope.clone(challengeToClone);

        expect(scope.newChallenge.rewards.length).to.eql(challengeToClone.rewards.length);
        expect(scope.newChallenge.rewards[0].text).to.eql(challengeToClone.rewards[0].text);
        expect(scope.newChallenge.rewards[0].notes).to.eql(challengeToClone.rewards[0].notes);
      });
    });
  });

  describe('User interactions', function() {
    describe('join', function() {
      it('calls challenge join endpoint');
    });

    describe('clickLeave', function() {
      it('opens a popover to confirm');
    });

    describe('leave', function() {
      it('(@TODO: write tests)');
    });
  });
});
