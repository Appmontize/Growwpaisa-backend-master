const axios = require('axios');
const { Wallet, Click, Campaign } = require('../models');

const handlePostback = async (req, res) => {
  const { tid } = req.query;

  if (!tid) {
    return res.status(400).json({ status: 'failure', message: 'Missing tid parameter' });
  }

  try {
    console.log('Received tid:', tid); // Ensure tid is received correctly

    // Correctly query using the received tid
    const click = await Click.findOne({
      where: { click_id: tid },
      include: Campaign,
    });

    if (!click) {
      return res.status(404).json({ status: 'failure', message: 'Click ID not found' });
    }

    const { user_id, campaign_id } = click;
    const campaign = click.Campaign;

    if (!campaign) {
      return res.status(404).json({ status: 'failure', message: 'Campaign not found' });
    }

    const coins = campaign.coins;

    let wallet = await Wallet.findOne({ where: { user_id } });

    if (!wallet) {
      wallet = await Wallet.create({ user_id, coins: 0 });
    }

    wallet.coins += coins;
    await wallet.save();

    console.log(`Wallet updated for user ${user_id}: +${coins} coins from campaign ${campaign_id}`);

    const postbackUrl = `http://paychat.fuse-cloud.com/pb?tid=${encodeURIComponent(tid)}`;
    const response = await axios.get(postbackUrl);
    console.log("Postback fired: ", response.data);

    return res.status(200).json({
      status: 'success',
      message: 'Wallet updated successfully',
      wallet,
      campaign: { id: campaign_id, title: campaign.title, coins },
    });
  } catch (error) {
    console.error('Error processing postback:', error);
    return res.status(500).json({ status: 'failure', message: 'Internal server error' });
  }
};



module.exports = { handlePostback };
