const axios = require('axios');
const { Wallet, Click, Campaign } = require('../models');

const handlePostback = async (req, res) => {
  let { tid } = req.query; // Extract aff_click_id (tid) from the query

  if (!tid) {
    return res.status(400).json({ status: 'failure', message: 'Missing aff_click_id parameter' });
  }

  try {
    // Clean the aff_click_id to remove unwanted characters
    tid = tid.replace(/^\$/, ''); // Remove the leading "$" if present
    console.log(`Processing postback for aff_click_id: ${tid}`);

    // Fetch the Click record using aff_click_id
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

    // Check if the postback has already been processed
    if (click.processed) {
      return res.status(200).json({
        status: 'success',
        message: 'Postback already processed for this click.',
      });
    }

    // Update the user's wallet
    let wallet = await Wallet.findOne({ where: { user_id } });
    if (!wallet) {
      wallet = await Wallet.create({ user_id, coins: 0 });
    }
    wallet.coins += coins;
    await wallet.save();

    // Mark the click as processed
    click.processed = true;
    await click.save();

    console.log(`Wallet updated for user ${user_id}: +${coins} coins from campaign ${campaign_id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Postback verified and wallet updated',
    });
  } catch (error) {
    console.error('Error processing postback:', error);
    return res.status(500).json({ status: 'failure', message: 'Internal server error' });
  }
};


module.exports = { handlePostback };


