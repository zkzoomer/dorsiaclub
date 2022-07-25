import requests
import asyncio
import time
import json
import os
from card import Card
from web3 import Web3
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

    def __init__(self, processing_ids, card_contract, start_block_file, provider):
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

        with open('./doc/BusinessCard.json') as f:
            cardABI = json.load(f)['abi']  # Reading the provided Card contract ABI
            f.close()
        card_addy = card_contract['addy']
        self.contract = self.web3.eth.contract(address=card_addy, abi=cardABI)

        # Will start iterating on the starting block provided
        self.start_block_file = start_block_file
        with open(start_block_file, 'r') as f:
            self.last_block = int(f.read())
            f.close()

        # Minimum waiting time between managing updates, in seconds
        self.wait_time = 5
        # Time waited between sending OK-status messages, in seconds
        self.message_wait_time = 60 * 60

        # Admin Telegram chat
        with open('./doc/TELEGRAM_API.json') as f:
            data = json.load(f)
            self.bot_token = data['PRIVATE_BOT_API_TOKEN']
            self.channel_id = data['PRIVATE_CHANNEL_ID']
            f.close()

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

        """# Get the wallet addy for the first pkey and save it into a file if it does not already exist
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
        # Get address and private_key"""

        # TEMPORARY FIX
        with open('./doc/pkey.txt', 'r') as f:
            self.pkey = f.read()
        with open('./doc/addy.txt', 'r') as f:
            self.addy = f.read()

        """self.addy = bip44_hdwallet.address()
        self.pkey = bip44_hdwallet.private_key()
        print(self.pkey)
        # Clean derivation indexes/paths
        bip44_hdwallet.clean_derivation()"""

        # Starting nonce, program will add to it sequentially
        # If this request doesn't work, it means the node is down, we will change it on next execution
        try:
            self.nonce = self.web3.eth.get_transaction_count(self.addy)
        except:
            if provider == "moralis":
                todump = { "provider": "getblock" }
            elif provider == "getblock":
                todump = { "provider": "quicknode" }
            elif provider == "quicknode":
                todump = { "provider": "moralis" }
            with open('./doc/node.json', 'w') as f:
                json.dump(todump, f)
                f.close()
            # Inform of provider change
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='> PROVIDER CHANGED TO {}'.format(todump["provider"].upper())
            )
            requests.post(req)
            exit()

        """# Saving addy in a file to then get it whitelisted in the Card smart contract -- this gets done every execution
        with open('./doc/addy.txt', 'w') as f:
            f.write(self.addy)
        # Also saving the pkey for development purposes
        with open('./doc/pkey.txt', 'w') as f:
            f.write(self.pkey)"""

    # https://cryptomarketpool.com/how-to-listen-for-ethereum-events-using-web3-in-python/

    async def _handle_update_event(self, event_data):
        # Take the values from the event
        tokenId = event_data['tokenId']  # Returns an int

        # Check if event has already been handled by looking at the active requests in the contract
        if not self.contract.functions.requests(tokenId).call():
            return  # Token was already updated, trying to do so again would revert

        # Check current values for properties
        current_uri = self.contract.functions.tokenURI(tokenId).call()
        current_metadata = requests.get(current_uri).json()
        current_properties = current_metadata['card_properties']

        # Fetch properties from the event
        name = event_data['name']
        position = event_data['cardProperties'][0]
        event_properties = {
            'twitter_account': event_data['cardProperties'][1],
            'telegram_account': event_data['cardProperties'][2],
            'telegram_group': event_data['cardProperties'][3],
            'discord_account': event_data['cardProperties'][4],
            'discord_group': event_data['cardProperties'][5],
            'github_username': event_data['cardProperties'][6],
            'website': event_data['cardProperties'][7]
        }
        genes = str(event_data['genes'])
        # Genes formatted to add leading zeros to 26 characters, else the Card class will throw
        for i in range(26 - len(genes)):
            genes = '0' + genes

        # Contrast, keep card name/position if specified as "" -- LEGACY on the position side
        if name == "":
            name = current_metadata['card_name']
        if position == "":
            position = current_metadata['card_position']
        new_properties = {}
        for dict_key, dict_value in event_properties.items():
            new_properties[dict_key] = str(event_properties[dict_key])  # Taking properties AS IS
            """if dict_value == "" or dict_value == 0:
                new_properties[dict_key] = current_properties[dict_key]
            else:
                new_properties[dict_key] = str(event_properties[dict_key])  # The discord account ID will be made string"""

        try:
            # Use this name, position to generate a new card and get the ipfs hash
            newcardwhatdoyouthink = Card(tokenId, name, position, genes, new_properties)
            tokenURI, image_path, thumbnail_path = newcardwhatdoyouthink.get_tokenURI_hash()

            callback = self.contract.functions.updateCallback(
                tokenId,
                tokenURI[2:]
                # First two characters of tokenURI are always 'Qm', and thus are taken off - found in baseURI
            ).buildTransaction({
                'from': self.addy,
                'nonce': self.nonce,
                'gasPrice': self.web3.eth.gas_price
            })

            self.nonce += 1

            signed_tx = self.web3.eth.account.sign_transaction(callback, self.pkey)
            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            # print('signed and done: ', tx_hash.hex())
            # Inform on public telegram bot about successful update with the image that was stored by the Card class
            # Inform admin of updated card
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='BTTC: updateCallback for token {}'.format(tokenId)
            )
            requests.post(req)
        except:
            # Transaction failed, will try again after restart
            # TODO: have a vairable to not update block if failed tx
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='BTTC: updateCallback for token {}  failed, restarting'.format(tokenId)
            )
            requests.post(req)
            exit()
        finally:
            # Removes the images from the disk
            os.remove(image_path)
            os.remove(thumbnail_path)
            # Removes the card object from memory to save up $$$
            del newcardwhatdoyouthink

    async def _handle_swap_event(self, event_data):
        # Take the values from the event
        tokenId1 = event_data['tokenId1']  # Returns an int
        tokenId2 = event_data['tokenId2']  # Returns an int

        # Check if event has already been handled by looking at the active requests in the contract
        if not self.contract.functions.requests(tokenId1).call():
            return  # Token was already updated, trying to do so again would revert
        if not self.contract.functions.requests(tokenId2).call():
            return  # Token was already updated, trying to do so again would revert

        # Fetch genes from the event
        genes1 = str(event_data['genes1'])
        genes2 = str(event_data['genes2'])
        # Genes formatted to add leading zeros to 26 characters, else the Card class will throw
        for i in range(26 - len(genes1)):
            genes1 = '0' + genes1
        for i in range(26 - len(genes2)):
            genes2 = '0' + genes2

        # Check current values for name, position, and properties of both tokens
        current_uri_1 = self.contract.functions.tokenURI(tokenId1).call()
        current_metadata_1 = requests.get(current_uri_1).json()
        current_name_1 = current_metadata_1['card_name']
        current_position_1 = current_metadata_1['card_position']
        current_properties_1 = current_metadata_1['card_properties']

        current_uri_2 = self.contract.functions.tokenURI(tokenId2).call()
        current_metadata_2 = requests.get(current_uri_2).json()
        current_name_2 = current_metadata_2['card_name']
        current_position_2 = current_metadata_2['card_position']
        current_properties_2 = current_metadata_2['card_properties']

        try:
            # Generate card one keeping genes but using card 2 name/properties
            newcardwhatdoyouthink_1 = Card(tokenId1, current_name_2, current_position_2, genes1, current_properties_2)
            tokenURI_1, image_path_1, thumbnail_path_1 = newcardwhatdoyouthink_1.get_tokenURI_hash()

            newcardwhatdoyouthink_2 = Card(tokenId2, current_name_1, current_position_1, genes2, current_properties_1)
            tokenURI_2, image_path_2, thumbnail_path_2 = newcardwhatdoyouthink_2.get_tokenURI_hash()

            callback = self.contract.functions.swapCallback(
                tokenId1,
                tokenId2,
                tokenURI_1[2:],
                tokenURI_2[2:]
                # First two characters of tokenURI are always 'Qm', and thus are taken off - found in baseURI
            ).buildTransaction({
                'from': self.addy,
                'nonce': self.nonce,
                'gasPrice': self.web3.eth.gas_price
            })

            self.nonce += 1

            signed_tx = self.web3.eth.account.sign_transaction(callback, self.pkey)
            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            # print('signed and done: ', tx_hash.hex())
            # Inform on public telegram bot about successful update with the image that was stored by the Card class
            # Inform admin of updated card
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='swapCallback for tokens {} and {}'.format(tokenId1, tokenId2)
            )
            requests.post(req)
        except:
            # Transaction failed, will try again after restart
            # TODO: have a vairable to not update block if failed tx
            req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                botToken=self.bot_token, chatID=self.channel_id,
                text='swapCallback for tokens {} and {} failed, restarting'.format(tokenId1, tokenId2)
            )
            requests.post(req)
            exit()
        finally:
            # Removes the images from the disk
            os.remove(image_path_1)
            os.remove(image_path_2)
            os.remove(thumbnail_path_1)
            os.remove(thumbnail_path_2)
            # Removes the card object from memory to save up $$$
            del newcardwhatdoyouthink_1
            del newcardwhatdoyouthink_2

    async def _handle_live_events(self, event_filter, poll_interval):
        while True:
            for event_data in event_filter.get_new_entries():
                await self._handle_event(event_data['args'])
                # print(event_data['args'])
            await asyncio.sleep(poll_interval)

    async def run(self):
        """Runs the ListeningOracle, listening to new events, and updating those tokenIds ending in processingIds"""

        ### PROCESSING PAST EVENTS
        # Scans the blockchain for all past events after a given blockNumber and processes them

        # Defines the events it is looking for
        update_event = self.contract.events.UpdateRequest
        update_abi = update_event._get_event_abi()
        update_abi_codec = update_event.web3.codec

        swap_event = self.contract.events.SwapRequest
        swap_abi = swap_event._get_event_abi()
        swap_abi_codec = swap_event.web3.codec

        start_time = time.time() + self.wait_time  # Little buffer for restarts -- time for tx to get through
        message_time = time.time()

        # Will loop forever updating new events
        while True:
            if time.time() - start_time >= self.wait_time:
                # Holds the new last block value, adding a little buffer for safety
                current_block = self.web3.eth.get_block_number()
                new_last_block = current_block + 1  # Next time, we start on the NEXT block

                # Finds new logs -- UpdateRequest event
                update_data_filter_set, update_event_filter_params = construct_event_filter_params(
                    update_abi,
                    update_abi_codec,
                    contract_address=update_event.address,
                    fromBlock=self.last_block
                )
                update_logs = update_event.web3.eth.getLogs(update_event_filter_params)

                # Finds new logs -- SwapRequest event
                swap_data_filter_set, swap_event_filter_params = construct_event_filter_params(
                    swap_abi,
                    swap_abi_codec,
                    contract_address=swap_event.address,
                    fromBlock=self.last_block
                )
                swap_logs = swap_event.web3.eth.getLogs(swap_event_filter_params)

                # Sets the last block
                self.last_block = new_last_block

                # Handles each log -- UpdateRequest event
                for entry in update_logs:
                    update_event_data = get_event_data(update_abi_codec, update_abi, entry)
                    await self._handle_update_event(update_event_data['args'])

                # Handles each log -- SwapRequest event
                for entry in swap_logs:
                    swap_event_data = get_event_data(swap_abi_codec, swap_abi, entry)
                    await self._handle_swap_event(swap_event_data['args'])

                with open(self.start_block_file, 'w') as f:
                    f.write(str(self.last_block))
                    f.close()

                # Sets the new start time
                start_time = time.time()

                # Will restart after processing the batch
                exit()

            else:
                time.sleep(self.wait_time)

            # Sending OK-status messages to a private channel -- to follow live the state of the bot
            if int(time.time()) % self.message_wait_time <= 60:
                balance = self.web3.eth.get_balance(self.addy)
                balance = round(self.web3.fromWei(balance, 'ether'), 4)

                # Send a request to post the message
                req = 'https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatID}&text={text}'.format(
                    botToken=self.bot_token, chatID=self.channel_id,
                    text='BTTC: Oracle running smoothly, current balance: {}'.format(balance)
                )
                requests.post(req)
                # Update the last message time
                message_time = time.time()
                time.sleep(60)

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


if __name__ == '__main__':
    processingIds = '0123456789'  # legacy and useless bit i havent brought myself to remove

    with open('doc/node.json') as f:
        data = json.load(f)
        provider = data['provider']
        f.close()

    """
    # Local testing
    cardContract = {
        "addy": '0x016d298D31cF111d22695AD2163822b38BA03E37',
        "provider": 'http://127.0.0.1:7545',  # Testing on Ganache
        "kind": "HTTP"
    }
    start_block_file = "./doc/start_block_testing.txt"
    """
    if provider == "getblock":
        with open('doc/ENDPOINT_API.json') as f:
            data = json.load(f)
            key = data['GETBLOCK_API_KEY']
            f.close()
        rpc = "wss://matic.getblock.io/testnet/?api_key={}".format(key)
    elif provider == "moralis":
        with open('doc/ENDPOINT_API.json') as f:
            data = json.load(f)
            key = data['MORALIS_API_KEY']
            f.close()
        rpc = "wss://speedy-nodes-nyc.moralis.io/{}/polygon/mumbai/ws".format(key)
    elif provider == "quicknode":
        with open('doc/ENDPOINT_API.json') as f:
            data = json.load(f)
            key = data['QUICKNODE_API_KEY']
            f.close()
        rpc = "wss://delicate-bold-night.matic-testnet.discover.quiknode.pro/{}/".format(key)

    """# MATIC testnet
    cardContract = {
        "addy": '0x384c8072DA488698Df87c02cDf04499262D4697f',
        "provider": rpc,
        "kind": "WS"
    }
    start_block_file = "./doc/start_block.txt"
    """

    # BTTC testnet
    cardContract = {
        "addy": '0xac2ef62E283A61D05A1f0a00CF9C8E6d74Ef43ca',
        "provider": 'https://pre-rpc.bt.io/',
        "kind": 'HTTP'
    }
    start_block_file = "./doc/start_block_bttc.txt"

    lo = ListeningOracle(processingIds, cardContract, start_block_file, provider)
    asyncio.run(lo.run())

