const axios = require('axios');
const { Wallet, Click, Campaign } = require('../models');

const handlePostback = async (req, res) => {
  const { tid } = req.query; // Extract tid from the frontend request

  if (!tid) {
    return res.status(400).json({ status: 'failure', message: 'Missing tid parameter' });
  }

  try {
    // Find the click record and include the associated campaign
    const click = await Click.findOne({ where: { click_id: tid }, include: Campaign });

    if (!click) {
      return res.status(404).json({ status: 'failure', message: 'Click ID not found' });
    }

    // Extract the user ID and campaign details
    const { user_id, campaign_id } = click;
    const campaign = click.Campaign;

    if (!campaign) {
      return res.status(404).json({ status: 'failure', message: 'Campaign not found' });
    }

    const coins = campaign.coins; // Get the coins value from the campaign

    // Locate the user's wallet
    let wallet = await Wallet.findOne({ where: { user_id } });

    // If no wallet exists, create one
    if (!wallet) {
      wallet = await Wallet.create({ user_id, coins: 0 });
    }

    // Update the wallet with the campaign coins
    wallet.coins += coins;
    await wallet.save();

    console.log(`Wallet updated for user ${user_id}: +${coins} coins from campaign ${campaign_id}`);

    // Fire postback to the given URL with tid as a parameter
    const postbackUrl = `http://paychat.fuse-cloud.com/pb?tid=${encodeURIComponent(tid)}`;

    try {
      const response = await axios.get(postbackUrl);
      console.log("Postback fired: ", response.data);
    } catch (error) {
      console.error("Error firing postback: ", error);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Wallet updated successfully',
      wallet,
      campaign: { id: campaign_id, title: campaign.title, coins },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failure', message: 'Internal server error' });
  }
};

module.exports = { handlePostback };
