import w3storage
import json

with open('../doc/WEB3STORAGE.json') as f:
    data = json.load(f)
    token = data['API_TOKEN']
    f.close()

w3 = w3storage.API(token=token)

imgpath_to_pin = '../assets/_default-URI.png'
thumbnailpath_to_pin = '../assets/_default-URI_thumbnail.png'

img_cid = w3.post_upload(('default_card.jpg', open(imgpath_to_pin, 'rb')))
thumbnail_cid = w3.post_upload(('thumbnail.jpg', open(thumbnailpath_to_pin, 'rb')))
print(img_cid, thumbnail_cid)
# img_cid: bafkreicapoqsvwia6pcky6oxyir52mdjhmurkksoe4zbstmxrpk4pa7vnm
# thumbnail_cid: bafkreiemsaharjdxt3jykvbbf3ap6jtaa2lxywhl63e2jlpuvryw2gegry

empty_properties = {
    'twitter_account': '',
    'telegram_account': '',
    'telegram_group': '',
    'discord_account': '0',
    'discord_group': '',
    'github_username': '',
    'website': ''
}

_metadata = {
    "id": 0,
    "name": "Dorsia Club",
    "description": "Because every self-respected businessman needs a business card",
    "card_name": '? ? ?',
    "card_position": '? ? ?',
    "card_properties": empty_properties,
    "external_url": "https://dorsiaclub.netlify.app/",
    "image": img_cid,
    "thumbnail": thumbnail_cid,
    "attributes": {}
}
metadata = json.dumps(_metadata)

uri_cid = w3.post_upload(('metadata.json', metadata))
print(uri_cid)
# bafkreiexdok6ezqxwwgd57zxdg5yaxfxm5w4suu2iw33opkr35rajg5qz4