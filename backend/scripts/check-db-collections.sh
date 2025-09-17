#!/bin/bash

echo "📊 Checking Database Collections..."
echo "=================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Starting it..."
    brew services start mongodb/brew/mongodb-community
    sleep 5
fi

echo "🔍 Checking collections in smart_app database..."
echo ""

# Use mongosh to check collections
mongosh --eval "
use('smart_app');
print('📋 Collections in smart_app database:');
print('=====================================');
db.runCommand('listCollections').cursor.firstBatch.forEach(function(collection) {
    var count = db[collection.name].countDocuments();
    print('📄 ' + collection.name + ': ' + count + ' documents');
});
print('');
print('🎯 Sample documents:');
print('===================');
if (db.policies.countDocuments() > 0) {
    print('📋 Policies:');
    db.policies.find().limit(1).forEach(printjson);
}
if (db.payouts.countDocuments() > 0) {
    print('💸 Payouts:');
    db.payouts.find().limit(1).forEach(printjson);
}
if (db.pool_events.countDocuments() > 0) {
    print('💰 Pool Events:');
    db.pool_events.find().limit(1).forEach(printjson);
}
if (db.triggers.countDocuments() > 0) {
    print('🌡️ Triggers:');
    db.triggers.find().limit(1).forEach(printjson);
}
if (db.cessions.countDocuments() > 0) {
    print('🤝 Cessions:');
    db.cessions.find().limit(1).forEach(printjson);
}
if (db.rules.countDocuments() > 0) {
    print('📜 Rules:');
    db.rules.find().limit(1).forEach(printjson);
}
if (db.policy_status_history.countDocuments() > 0) {
    print('📊 Policy Status History:');
    db.policy_status_history.find().limit(1).forEach(printjson);
}
" --quiet
