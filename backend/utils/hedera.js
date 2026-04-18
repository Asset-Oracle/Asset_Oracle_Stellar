const { 
  Client, 
  PrivateKey, 
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction
} = require('@hashgraph/sdk');

// Initialize Hedera client for testnet
const initHederaClient = () => {
  const client = Client.forTestnet();
  
  // Set operator (your Hedera account)
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  
  client.setOperator(operatorId, operatorKey);
  
  return client;
};

// Create HTS token for property tokenization
const createPropertyToken = async (propertyName, totalSupply, decimals = 0) => {
  try {
    const client = initHederaClient();
    
    const transaction = await new TokenCreateTransaction()
      .setTokenName(propertyName)
      .setTokenSymbol('PROP')
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(decimals)
      .setInitialSupply(totalSupply)
      .setTreasuryAccountId(client.operatorAccountId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(totalSupply)
      .freezeWith(client);
    
    const signedTx = await transaction.sign(client.operatorPublicKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);
    
    return {
      tokenId: receipt.tokenId.toString(),
      transactionId: response.transactionId.toString()
    };
  } catch (error) {
    console.error('Error creating Hedera token:', error);
    throw error;
  }
};

// Create HCS topic for verification audit trail
const createVerificationTopic = async (memo) => {
  try {
    const client = initHederaClient();
    
    const transaction = await new TopicCreateTransaction()
      .setTopicMemo(memo)
      .freezeWith(client);
    
    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    
    return {
      topicId: receipt.topicId.toString(),
      transactionId: response.transactionId.toString()
    };
  } catch (error) {
    console.error('Error creating HCS topic:', error);
    throw error;
  }
};

// Submit verification message to HCS topic
const submitVerificationMessage = async (topicId, message) => {
  try {
    const client = initHederaClient();
    
    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(message))
      .freezeWith(client);
    
    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    
    return {
      sequenceNumber: receipt.topicSequenceNumber.toString(),
      transactionId: response.transactionId.toString()
    };
  } catch (error) {
    console.error('Error submitting to HCS:', error);
    throw error;
  }
};

module.exports = {
  initHederaClient,
  createPropertyToken,
  createVerificationTopic,
  submitVerificationMessage
};