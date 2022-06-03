import requests
import asyncio
import time
import json
import os
from card import Card
from web3 import Web3
from hdwallet import BIP44HDWallet
from hdwallet.cryptocurrencies import EthereumMainnet
from hdwallet.derivations import BIP44Derivation
from hdwallet.utils import generate_mnemonic
from web3 import Web3
from web3._utils.filters import construct_event_filter_params
from web3._utils.events import get_event_data
from web3.middleware import geth_poa_middleware
from os.path import exists
from typing import Optional



# Connecting to the web3 provider
RPC = ''
web3 = Web3(Web3.HTTPProvider(RPC))





class ListeningOracle():

    def __init__(self, processing_ids, card_contract, start_block_file):
        """
        Initializes the ListeningOracle

        Args:
            processingIds: string, ending numbers of those processingIds to be handled by this instance of the lo
            cardContract: dictionary, addy for the Card contract, as well as network where it was deployed
            start_block: int, from which to process events, for not handling all in case of oracle redeployment
        """

        # Ending ID numbers to be handled by this instance of the ListeningOracle
        self.processing_ids = processing_ids

        # Card smart contract and web3 initializing
        if card_contract['kind'] == 'HTTP':
            self.web3 = Web3(Web3.HTTPProvider(card_contract['provider']))  # where Card contract was deployed
        elif card_contract['kind'] == 'WS':
            self.web3 = Web3(Web3.WebsocketProvider(card_contract['provider']))
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)


        with open('../contracts/BusinessCard/build/contracts/BusinessCard.json') as f:
            cardABI = json.load(f)['abi']  # Reading the provided Card contract ABI
            f.close()
        card_addy = card_contract['addy']
        self.contract = self.web3.eth.contract(address=card_addy, abi=cardABI)

        # Will start iterating on the starting block provided
        self.start_block_file = start_block_file
        with open(start_block_file, 'r') as f:
            self.last_block = int(f.read())
            f.close()

        # Admin Telegram chat
        with open('./doc/TELEGRAM_API.json') as f:
            data = json.load(f)
            self.bot_token = data['PRIVATE_BOT_API_TOKEN']
            self.channel_id = data['PRIVATE_CHANNEL_ID']
            f.close()

        # Minimum waiting time between managing updates, in seconds
        self.wait_time = 5
        # Time waited between sending OK-status messages to admin telegram chat, in seconds
        self.message_wait_time = 30*60

        # Read the sneedphrase from the txt file, or generate one if none exists prior
        try:
            with open('./doc/sneed.txt', 'r') as f:
                self.sneed = f.read()
                f.close()
        except FileNotFoundError:
            # No sneed exists, generate one and save it
            self.sneed: str = generate_mnemonic(language="english", strength=128)
            with open('./doc/sneed.txt', 'x') as f:
                f.write(self.sneed)
                f.close()

        # Get the wallet addy for the first pkey and save it into a file if it does not already exist
        bip44_hdwallet: BIP44HDWallet = BIP44HDWallet(cryptocurrency=EthereumMainnet)
        # Get Ethereum BIP44HDWallet from mnemonic
        bip44_hdwallet.from_mnemonic(mnemonic=self.sneed, language="english")
        # Clean default BIP44 derivation indexes/paths
        bip44_hdwallet.clean_derivation()

        # Derivation from Ethereum BIP44 derivation path
        bip44_derivation: BIP44Derivation = BIP44Derivation(
            cryptocurrency=EthereumMainnet, account=0, change=False, address=0
        )
        # Drive Ethereum BIP44HDWallet
        bip44_hdwallet.from_path(path=bip44_derivation)
        # Get address and private_key
        self.addy = bip44_hdwallet.address()
        self.pkey = bip44_hdwallet.private_key()
        # Clean derivation indexes/paths
        bip44_hdwallet.clean_derivation()

        # Saving addy in a file to then get it whitelisted in the Card smart contract -- this gets done every execution
        with open('./doc/addy.txt', 'w') as f:
            f.write(self.addy)
            f.close()
        # Also saving the pkey for development purposes
        with open('./doc/pkey.txt', 'w') as f:
            f.write(self.pkey)
            f.close()

        # Starting nonce, program will add to it sequentially
        self.nonce = self.web3.eth.get_transaction_count(self.addy, "pending")

    # https://cryptomarketpool.com/how-to-listen-for-ethereum-events-using-web3-in-python/

    async def _handle_event(self, event_data):

        # Take the values from the event
        tokenId = event_data['tokenId']  # Returns an int

        # Check if event has already been handled by looking at the active requests in the contract
        if not self.contract.functions.requests(tokenId).call():
            return  # Token was already updated, trying to do so again would revert

        name = event_data['name']  # Returns a string
        position = event_data['position']  # Returns a string
        genes = str(event_data['genes'])  # Returns an int, converted to string
        # Genes formatted to add leading zeros to 26 characters, else the Card class will throw
        for i in range(26 - len(genes)):
            genes = '0' + genes

        # Generates the new Card URI and gets the hash
        newcardwhatdoyouthink = Card(tokenId, name, position, genes)
        tokenURI, image_path, thumbnail_path = newcardwhatdoyouthink.get_tokenURI_hash()

        # Calls the Card contract callback function to finalize the update of this tokenURI
        try:
            callback = self.contract.functions.callback(
                tokenId,
                tokenURI[2:]  # First two characters of tokenURI are always 'Qm', and thus are taken off - found in baseURI
            ).buildTransaction({
                'from': self.addy,
                'nonce': self.nonce,
                'gasPrice': self.web3.eth.gas_price
            })
        except:
            pass

        self.nonce += 1

        try:
            signed_tx = self.web3.eth.account.sign_transaction(callback, self.pkey)
            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            #print('signed and done: ', tx_hash.hex())
            # Inform on public telegram bot about successful update with the image that was stored by the Card class
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='Just processed token {}'.format(tokenId)
            )
            requests.post(req)
        except:
            # Transaction failed, will try again after restart
            # TODO: have a vairable to not update block if failed tx
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='Callback for token {}  failed, restarting'.format(tokenId)
            )
            requests.post(req)

            # Removes the images from the disk
            os.remove(image_path)
            os.remove(thumbnail_path)
            # Removes the card object from memory to save up $$$
            del newcardwhatdoyouthink

            exit()
        finally:
            # Removes the images from the disk
            os.remove(image_path)
            os.remove(thumbnail_path)
            # Removes the card object from memory to save up $$$
            del newcardwhatdoyouthink
            


    async def _handle_live_events(self, event_filter, poll_interval):
        while True:
            for event_data in event_filter.get_new_entries():
                await self._handle_event(event_data['args'])
                #print(event_data['args'])
            await asyncio.sleep(poll_interval)

    async def run(self):
        """Runs the ListeningOracle, listening to new events, and updating those tokenIds ending in processingIds"""

        ### PROCESSING PAST EVENTS
        # Scans the blockchain for all past events after a given blockNumber and processes them

        # Defines the event it is looking for
        event = self.contract.events.NewRequestEvent
        abi = event._get_event_abi()
        abi_codec = event.web3.codec

        start_time = time.time() + self.wait_time  # Little buffer for restarts -- time for tx to get through
        message_time = time.time()

        # Will loop forever updating new events
        while True:
            if time.time() - start_time >= self.wait_time:
                # Holds the new last block value, adding a little buffer for safety
                current_block = self.web3.eth.get_block_number()
                new_last_block = current_block - 1
                
                # Finds new logs
                data_filter_set, event_filter_params = construct_event_filter_params(
                    abi,
                    abi_codec,
                    contract_address=event.address,
                    fromBlock=self.last_block
                )
                logs = event.web3.eth.getLogs(event_filter_params)

                # Handles each log
                for entry in logs:
                    event_data = get_event_data(abi_codec, abi, entry)
                    await self._handle_event(event_data['args'])

                # Sets the new start time
                start_time = time.time()

                # Will restart after processing the batch
                exit()

            else:
                time.sleep(self.wait_time)

            # Sending OK-status messages to Telegram adminz -- to follow live the state of the bot
            if int(time.time()) % self.message_wait_time <= 60:
                balance = self.web3.eth.get_balance(self.addy)
                balance = round(self.web3.fromWei(balance, 'ether'), 4)

                # Send a request to post the message
                req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                    botToken=self.bot_token, chatID=self.channel_id,
                    text='Oracle running smoothly, current balance: {}'.format(balance)
                )
                requests.post(req)
                # Update the last message time
                message_time = time.time()


if __name__ == '__main__':
    processingIds = '0123456789'

    with open('./doc/GETBLOCK_API.json') as f:
        data = json.load(f)
        getblock_key = data['GETBLOCK_API_KEY']
        f.close()

    # MATIC testnet
    cardContract = {
        "addy": '0x798E1eFBFFB2d6315d1Ab62Cd80C1c56A7C5E70d',
        "provider": "wss://matic.getblock.io/testnet/?api_key=" + getblock_key,
        "kind": "WS"
    }
    start_block_file = "./doc/start_block.txt"
    lo = ListeningOracle(processingIds, cardContract, start_block_file)
    asyncio.run(lo.run())

    # For development: https://github.com/ChainSafe/web3.js/issues/2053

