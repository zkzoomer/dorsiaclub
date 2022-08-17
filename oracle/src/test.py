import requests
import json

req_url = 'https://' + 'bafkreibhreyp4ni2qmcecssms4gbbh4ewnskwiqng6gtg53wpvhwpsapaq' + '.ipfs.dweb.link/'
req = requests.get(req_url)
print(req)
current_metadata = req.json()

