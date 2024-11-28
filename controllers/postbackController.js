const axios = require('axios');
const { Wallet, Click, Campaign } = require('../models');

const handlePostback = async (req, res) => {
  let { tid } = req.query;

  if (!tid) {
    return res.status(400).json({ status: 'failure', message: 'Missing aff_click_id parameter' });
  }

  try {
    // Remove the `$` character if present
    tid = tid.replace(/^\$/, '');

    console.log(`Processing postback for aff_click_id: ${tid}`);

    // Fetch the Click record
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

    // Check if the user exists in the `users` table
    const userExists = await User.findOne({ where: { user_id } });
    if (!userExists) {
      return res.status(404).json({ status: 'failure', message: 'User not found in the database' });
    }

    // Check if the wallet exists
    let wallet = await Wallet.findOne({ where: { user_id } });
    if (!wallet) {
      // Create a new wallet for the user
      wallet = await Wallet.create({ user_id, coins: 0 });
    }

    // Update the wallet
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


