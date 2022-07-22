# Daemonic Bots

Bots take care of various maintenance operations in Daemons.
They have read/write access to the db and read access to the contracts.

## Bots List

Each bot has a name, because we truly care about them.

### Terminator Bot 🤖🪓

The Terminator bot (Arny) takes care of scripts that have been signaled as broken.
It verifies them and if they really are unusable, it will remove them from the DB.

### Tx-Adder Bot 🤖🔌

The Tx-Adder bot (Luca) listens to the logs from the GasTank and is triggered anytime
a script is executed. With that info, it adds new transactions in the db.

### Statistics Bot 🤖📊

The Statistics bot (Charles) is triggered multiple times a day to generate stats
about Daemons.
