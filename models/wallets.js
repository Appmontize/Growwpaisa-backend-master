// models/wallet.js
module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    wallet_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the table, not the model
        key: 'user_id',
      },
    },
    coins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Wallets',
    timestamps: false,
  });

  return Wallet;
};
