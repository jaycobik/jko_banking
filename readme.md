<img width="1205" height="708" alt="image" src="https://github.com/user-attachments/assets/bead1bd9-c05f-4f2b-8fdf-75f27c5fc5ea" />


JKO_BANKING
Modern banking system for FiveM servers with multi-account support, transfers, and Czech localization.
📋 Requirements

ESX Framework
oxmysql
ox_target
ox_lib
ox_inventory (for cash handling)

🔧 Installation

Upload the resource to your resources folder
Add to server.cfg:

ensure banking_system

Execute these SQL queries to create the database tables:

sql-- Bank accounts table
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(60) NOT NULL,
  `account_number` varchar(8) NOT NULL,
  `account_name` varchar(50) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_number` (`account_number`),
  KEY `identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions table
CREATE TABLE IF NOT EXISTS `bank_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_account_id` int(11) DEFAULT NULL,
  `from_account_number` varchar(8) DEFAULT NULL,
  `to_account_id` int(11) DEFAULT NULL,
  `to_account_number` varchar(8) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_type` enum('deposit','withdraw','transfer_in','transfer_out') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `from_account_id` (`from_account_id`),
  KEY `to_account_id` (`to_account_id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Balance history table for charts
CREATE TABLE IF NOT EXISTS `bank_balance_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `balance` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_date` (`account_id`,`date`),
  KEY `account_id` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
⚙️ Configuration
In config.lua you can modify:

Bank and ATM locations
Maximum accounts per player (default: 2)
Minimum transaction amount
Discord webhook for logging
Map blips settings

🎮 Usage
For Players:

Go to any ATM or bank location
Use ox_target to interact
Create accounts, deposit, withdraw, and transfer money

🌍 Languages
System supports English and Czech. Change in config.lua:
luaConfig.Locale = 'en' -- or 'cs'
📊 Features

✅ Multiple bank accounts per player
✅ Cash deposits and withdrawals
✅ Account-to-account transfers
✅ Transaction history with charts
✅ Discord logging
✅ Modern UI with animations
✅ Czech localization

🔍 Technical Details
The system automatically:

Creates first account for new players
Saves daily balances for chart data
Logs all transactions
Validates account numbers (8 digits)

📞 Support
If you find any bugs or have suggestions for improvements, contact me.

Discord: Jaku6ko
Author: Jakubko
Version: 1.0.0
