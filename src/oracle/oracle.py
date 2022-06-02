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

    def __init__(self, processing_ids, card_contract, start_block):
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
        card_addy = card_contract['addy']
        self.contract = self.web3.eth.contract(address=card_addy, abi=cardABI)

        # Will start iterating on the starting block provided
        self.last_block = start_block
        # Minimum waiting time between managing updates, in seconds
        self.wait_time = 5
        # Time waited between sending OK-status messages, in seconds
        self.message_wait_time = 60*60

        # Admin Telegram chat
        with open('./doc/TELEGRAM_API.json') as f:
            data = json.load(f)
            self.bot_token = data['PRIVATE_BOT_API_TOKEN']
            self.channel_id = data['PRIVATE_CHANNEL_ID']

        # Read the sneedphrase from the txt file, or generate one if none exists prior
        try:
            with open('./doc/sneed.txt', 'r') as f:
                self.sneed = f.read()
        except FileNotFoundError:
            # No sneed exists, generate one and save it
            self.sneed: str = generate_mnemonic(language="english", strength=128)
            with open('./doc/sneed.txt', 'x') as f:
                f.write(self.sneed)

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

        # This instance will only update genes with ending digits in processing_ids
        if not genes[-1] in processingIds:
            return

        # Generates the new Card URI and gets the hash
        newcardwhatdoyouthink = Card(tokenId, name, position, genes)
        tokenURI, image_path, thumbnail_path = newcardwhatdoyouthink.get_tokenURI_hash()

        #print('token URI:', tokenURI)

        #gas = await self.web3.eth.gasPrice
        # Calls the Card contract callback function to finalize the update of this tokenURI
        try:
            callback = self.contract.functions.callback(
                tokenId,
                tokenURI[2:]  # First two characters of tokenURI are always 'Qm', and thus are taken off - found in baseURI
            ).buildTransaction({
                'from': self.addy,
                'nonce': self.nonce,
                'gasPrice': self.web3.eth.gas_price
                # TODO: add fast gas
            })
        except:
            pass


        self.nonce += 1

        try:
            # TODO: wait for tx to be finalized before progressing
            signed_tx = self.web3.eth.account.sign_transaction(callback, self.pkey)
            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            #print('signed and done: ', tx_hash.hex())
            # Inform on public telegram bot about successful update with the image that was stored by the Card class
        except:
            # Transaction failed, inform on my private telegram bot to keep these rare events in check
            pass
            # TODO: MUST CHECK if tx failed due to no funds, inform as such on private tg bot

            # Delete the stored image from server memory
            #print('could not')
            # Delete the card object
        finally:
            # Removes the images from the disk
            os.remove(image_path)
            os.remove(thumbnail_path)
            # Removes the card object from memory to save up $$$
            del newcardwhatdoyouthink
            # Inform admin of updated card
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='Just processed token #{}'.format(tokenId)
            )
            requests.post(req)
            # Restarts the program -- prevents issues on server
            exit()


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

        start_time = time.time()
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

                # Sets the last block
                self.last_block = new_last_block
                # Sets the new start time
                start_time = time.time()

            else:
                time.sleep(0.5)

            # Sending OK-status messages to a private channel -- to follow live the state of the bot
            if time.time() - message_time >= self.message_wait_time:
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


        ### PROCESSING CURRENT EVENTS LIVE - NOT USED
        """event_filter = self.contract.events.NewRequestEvent.createFilter(fromBlock=self.start_block)

        loop = asyncio.get_event_loop()
        try:
            loop.run_until_complete(
                asyncio.gather(
                    self._handle_live_events(event_filter, 2)
                )
            )
        finally:
            loop.close()"""

        """
        RUNNING LOOP:
            >let start = 0, or block at deployment, or block at reupdating, or other
            >define threshold as timeframe to wait between two requests to not flood the service:
                -> blocks get added every 3 seconds on BSC
            >while True loop:
                >measure start_time
                >send request to see logs from_block = start
                >process each of the requests, if any, as already implemented
                >measure finish_time
                >if finish_time - start_time > threshold, continue loop
                >if finish_time - start_time < threshold, sleep for threshold - (finish_time - start_time), then continue
                >>>continue loop means whe set the start_block at the current one
        """


#oracle_contract = web3.eth.contract(address=oracle, abi=oracleABI)

# json.loads(Web3.toJSON(event))

if __name__ == '__main__':
    processingIds = '0123456789'

    with open('./doc/GETBLOCK_API.json') as f:
        data = json.load(f)
        getblock_key = data['GETBLOCK_API_KEY']

    # BSC Testnet
    cardContract = {
        "addy": '0x448310Ce1196f5EA89f638752d2f879B9B772300',
        "provider": "wss://matic.getblock.io/testnet/?api_key=" + getblock_key,
        "kind": "WS"
    }
    start_block = 18813761
    print('starting')
    lo = ListeningOracle(processingIds, cardContract, start_block)
    print('running')
    asyncio.run(lo.run())

    # For development: https://github.com/ChainSafe/web3.js/issues/2053

    # TODO: test several transactions being made AT THE SAME TIME, does the oracle get to process them? and how - yes it do

    # TODO: should restart itself every now and then ? - properly stress test it to see if necessary

