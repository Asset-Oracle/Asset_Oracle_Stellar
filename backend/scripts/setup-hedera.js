require('dotenv').config();
const { createVerificationTopic } = require('../utils/hedera');

async function setupHedera() {
  try {
    console.log('🔧 Setting up Hedera infrastructure...\n');
    
    console.log('Using Account ID:', process.env.HEDERA_ACCOUNT_ID);
    console.log('Network:', process.env.HEDERA_NETWORK);
    console.log('\n');
    
    // Create verification topic
    console.log('📝 Creating HCS verification topic...');
    const topic = await createVerificationTopic('AssetOracle Verification Audit Trail');
    
    console.log('\n✅ SUCCESS! Topic created!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Topic ID:', topic.topicId);
    console.log('Transaction ID:', topic.transactionId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📝 Copy this line to your .env file:\n');
    console.log(`HEDERA_VERIFICATION_TOPIC_ID=${topic.topicId}\n`);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

setupHedera();