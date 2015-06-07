PlayersList = new Mongo.Collection('players');

if(Meteor.isClient) {
    Meteor.subscribe('thePlayers');

    Template.leaderboard.helpers({
        'player': function (){
            return PlayersList.find({}, {sort: {score: -1, name: 1}
                });
        },
        'selectedClass': function(){
            var playerId = this._id;
            if(playerId == Session.get('selectedPlayer')) {
                return "selected";
            }else{
                return "";
            }
        },
        'showSelectedPlayer': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne(selectedPlayer);
        }
    });

    Template.leaderboard.events({
        'click .player': function() {
            var playerId = this._id;
            var score = this.score;
            Session.set('selectedPlayer', playerId);
            Session.set('selectedPlayerScore', score);
        },
        'click .increment': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            var score = Session.get('selectedPlayerScore');
            if(score<=95) {
                Meteor.call('modifyPlayerScore', selectedPlayer, 5);
                Session.set('selectedPlayerScore', score+5);
            }

        },
        'click .decrement': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            var score = Session.get('selectedPlayerScore');
            console.log(score);
            if(score>=5) {
                Meteor.call('modifyPlayerScore', selectedPlayer, -5);
                Session.set('selectedPlayerScore', score-5);
            }
        },
        'click .remove': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('removePlayerData', selectedPlayer);
        }
    });

    Template.addPlayerForm.events({
        'submit form': function(event){
            event.preventDefault();
            var playerNameVar = event.target.playerName.value;
            var playerScoreVar =  parseFloat(event.target.playerScore.value);

            Meteor.call('insertPlayerData', playerNameVar, playerScoreVar);
        }
    });


}

if(Meteor.isServer){
    Meteor.publish('thePlayers', function(){
        var currentUserId = this.userId;
        return PlayersList.find({createdBy: currentUserId});
    });
    Meteor.methods({
        'insertPlayerData': function(playerNameVar ,playerScoreVar){
            var currentUserId = Meteor.userId();
            PlayersList.insert({
                name: playerNameVar,
                score: playerScoreVar,
                createdBy: currentUserId
            });
        },
        'removePlayerData': function(selectedPlayer){
            PlayersList.remove(selectedPlayer);
        },
        'modifyPlayerScore': function(selectedPlayer, scoreValue){
            PlayersList.update(selectedPlayer, {$inc: {score: scoreValue} });
        }
    });
}