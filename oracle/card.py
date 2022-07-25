import json
import pinatapy
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter


class Card():

    def __init__(self, tokenId, name, position, genes, properties):
        """Used for generating new Business Card images, and altering existing templates

        Parameters:
            tokenId: integer, unique id of the token
            name: string, name of the Business Card owner
            position: string, position occupied
            genes: integer, characteristics that make up the NFT, a 23 digit number,
            00.00.00.00.00.00.00.00.00.00.00.00.00.0000:
                [0:2]: background
                [2:4]: type of paper
                [4:6]: paper color
                [6:8]: font used
                [8:10]: New York location
                [10:12]: cranberry juice (blood stains)
                [12:14]: shadow type
                [14:16]: watermark
                [16:18]: footprint
                [18:20]: defaced with pen
                [20:22]: lettering
                [22:24]: gold edges
                [24:26]: washed
                [26:30]: phone number
        """

        # Different attributes that make up the card
        self.type_list = ['Setting', 'Paper', 'Coloring', 'Font', 'Location', 'Cranberry juice', 'Shadow',
                          'Watermark', 'Footprint', 'Defaced', 'Special lettering', 'Gold edges', 'Washed',
                          'Phone number']

        self.genedict = {
            'Setting': {
                8: 'Kashmir Silk',
                16: 'VHS Static',
                17: 'Resin River',
                25: 'Connemara Marble',
                35: 'Calacatta Marble',
                45: 'Benjamins',
                55: 'Dissection',
                59: 'Old Growth',
                63: 'Office Table',
                68: 'Redwood Counter',
                70: 'Central Park',
                77: 'Dark Alley',
                87: 'Dorsia Club',
                92: 'Great Outdoors',
                99: 'Self Defense',
            },
            'Paper': {
                8: 'Imperial Print',
                10: 'Unpresentable',
                18: 'Leather Marked',
                26: 'Recycled Note',
                34: 'Misty Press',
                44: 'Rail Stamped',
                54: 'Mountain Craft',
                69: 'Capital Grade',
                84: 'Business Premium',
                99: 'Standard American'
            },
            'Coloring': {
                14: 'Glacier',
                29: 'Bone',
                44: 'Ivory',
                59: 'Eggshell',
                99: 'White'
            },
            'Font': {
                4: 'Dorsian Sea',  # 5%
                14: 'Port Carruthers',
                24: 'Silian Rail',
                34: 'Romalian Type',
                44: 'Pale Nimbus',
                54: 'Esoteric Antiqua',
                59: 'Century Block',  # 5%
                74: 'Bookman Type',  # 15%
                84: 'Babylon Script',
                99: 'Royal Script'  # 15%
            },
            'Location': {
                14: 'Golden Bullrun',
                21: 'Forty Fifth',
                26: 'Homeless',
                31: 'Dorsia',
                51: 'Mergers and Acquisitions',
                58: "Tom's Restaurant",
                63: 'Marina',
                71: 'Cemetery',
                79: 'The Center',
                99: 'Apartment',
            },
            'Cranberry juice': {
                14: True,
                99: None
            },
            'Shadow': {
                29: 'Menacing shadow',
                59: 'Focused shadow',
                99: None,
            },
            'Watermark': {
                2: True,
                99: None
            },
            'Footprint': {
                6: True,
                99: None
            },
            'Defaced': {
                6: True,
                99: None
            },
            'Special lettering': {
                24: 'Gold lettering',
                39: 'Silver lettering',
                99: None,
            },
            'Gold edges': {
                14: True,
                99: None
            },
            'Washed': {
                14: True,
                99: None,
            }
        }

        self.locationdict = {
            'Golden Bullrun': '11 Wall Street New York, N.Y. 10005, Phone: 212 656 3000',
            'Forty Fifth': '725 5th Avenue New York, N.Y. 10022, Phone: 212 832 2000',
            'Homeless': '',
            'Dorsia': '5E 19th Street New York, N.Y. 10003, Phone: 212 420 8636',
            'Mergers and Acquisitions': '358 Exchange Place New York, N.Y. 10099 fax 212 555 6390 telex 10 4534',
            "Tom's Restaurant": '2880 Broadway New York, N.Y. 10025, Phone: 212 864 6137',
            'Marina': '	250 Vesey Street New York, N.Y. 10281, Phone: 212 978 1636',
            'Cemetery': '49-02 Laurel Hill Boulevard Queens, N.Y. 11377, Phone: 718 786 8000',
            'The Center': '45 Rockefeller Plaza New York, N.Y. 10111, Phone: 212 588 8601',
            'Apartment': 'American Gardens Building, West 81st Street New York, N.Y.',
        }

        # Defines the parameters to be used by the Card
        self.tokenId = tokenId
        self.name = name
        self.position = position
        self.genes = genes
        # Gets the attributes from the genes, and validate them afterwards
        self._attributes = self._get_attributes(self.genes)
        self.attributes = self._validate_attributes()
        # Card properties, which are directly added to the metadata
        self.properties = properties

        # Card, program will be adding layers until completion -- initializing variable
        self.card = None

        # Initializing pinata API
        with open('./doc/PINATA_API.json') as f:
            data = json.load(f)
            pinata_api_key = data['PINATA_API_KEY']
            pinata_secret_api_key = data['PINATA_SECRET_API_KEY']
        self.pinata = pinatapy.PinataPy(pinata_api_key, pinata_secret_api_key)
        # Base URI is hosted on chain
        # TODO: change accordingly
        self.ipfs_gateway = 'https://dorsiaclub.mypinata.cloud/ipfs/'

    def _get_attributes(self, genes):
        """Relates the gene number to the corresponding attributes

        Generates an attribute dictionary to be used internally and a list of JSONs complying with the metadata standard

        Parameters:
            genes: integer, characteristics without any exclusive attribute, must be run through _validate_genes before
        Returns:
            _attributes: dictionary, containing the attributes that make up the NFT as key-value pairs
            attributes: list of JSONs, containing the attributes that make up the NFT following the metadata standard,
            [{"trait_type": "___", "value": "___"}, ..., {"trait_type": "___", "value": "___"}]
        """

        # Generate first the internal dictionary to be used
        _attributes = {}
        i = 0  # Index for iterating over the genes number
        for type in self.type_list:
            if type == 'Phone number':
                # Phone number just gets added to the list of attributes as an integer
                _attributes[type] = int(genes[26:30])
            else:
                # For the rest of the attributes, these need to be fetched
                _attributes[type] = self._get_attribute_from_number(type, int(genes[i:i + 2]))
                i += 2  # For next iteration

        return _attributes

    def _get_attribute_from_number(self, type, number):
        """Returns the corresponding attribute for a given attribute class and number

        Parameters:
            type: string, name of the attribute class, must be in self.attribute_list
            number: integer, randomly generated number that identifies the attribute
        Returns:
            attribute: corresponding attribute
        """

        # Returns the corresponding attribute name -- the value for the key: smallest bigger number than the provided
        return self.genedict[type][min(x for x in [int(i) for i in self.genedict[type].keys()] if x >= int(number))]

    def _validate_attributes(self):
        """Validates the attributes to ensure that they do not contain not supported cases.
        """

        # There are several checks to be made to the existing self._attributes dictionary to prevent incompatibilities
        # These checks override the previously set random behaviour

        # Unpresentable, Recycled Note paper: color must be White and cannot have bloodstains or gold edges
        if self._attributes['Paper'] == 'Unpresentable' or self._attributes['Paper'] == 'Recycled Note':
            self._attributes['Coloring'] = 'White'
            self._attributes['Cranberry juice'] = None
            self._attributes['Gold edges'] = None
        # Leather Marked paper: color must be White
        elif self._attributes['Paper'] == 'Leather Marked':
            self._attributes['Coloring'] = 'White'
        # Business Premium: color cannot be Ivory
        elif self._attributes['Paper'] == 'Business Premium' and self._attributes['Coloring'] == 'Ivory':
            self._attributes['Coloring'] = 'White'
        # Misty Press: color cannot be Ivory
        elif self._attributes['Paper'] == 'Misty Press' and self._attributes['Coloring'] == 'Ivory':
            self._attributes['Coloring'] = 'White'
        # Rail Stamped: color cannot be Ivory
        elif self._attributes['Paper'] == 'Rail Stamped' and self._attributes['Coloring'] == 'Ivory':
            self._attributes['Coloring'] = 'White'
        # Mountain Craft: color cannot be Ivory
        elif self._attributes['Paper'] == 'Mountain Craft' and self._attributes['Coloring'] == 'Ivory':
            self._attributes['Coloring'] = 'White'
        # Imperial Print: color cannot be Ivory
        elif self._attributes['Paper'] == 'Imperial Print' and self._attributes['Coloring'] == 'Ivory':
            self._attributes['Coloring'] = 'White'

        # Once _attributes are generated, its simple to generate the corresponding JSON
        attributes = []
        for type in self.type_list:
            attributes.append({
                "trait_type": type,
                "value": self._attributes[type]
            })

        return attributes

    def _generate_base(self):
        """Generates the base image, by superimposing the background, paper, and color together

        Does not return anything, simply changes the self.card attribute to this base
        """

        # Background gets opened first and assigned to the card object, other layers get added on top
        self.card = Image.open('./assets/Setting/{}.png'.format(self._attributes['Setting']))
        # Paper and color have been procedurally generated before hand and stored for all possible combinations
        paper_color = Image.open(
            './assets/Paper/{}-{}.png'.format(self._attributes['Paper'], self._attributes['Coloring']))
        # Adding the paper and color layers
        self.card.paste(paper_color, (0, 0), paper_color)
        ### Base is now generated!

    def _generate_text(self):
        """Adds the required text to the NFT Business Card

        Supports both black text and the special gold texture text
        """

        # Text coordinates for each of the text bits, these correspond to the center of the text block
        coordinates = {
            'phone': np.array((907, 645.5)),
            'project': np.array((0, 626.4)),  # Gets changed dynamically to ensure card symmetry
            'description': np.array((0, 670.1)),  # Gets changed dynamically to ensure card symmetry
            'name': np.array((1287, 893.4)),
            'position': np.array((1287, 957.9)),
            'location': np.array((1287, 1202.7))
        }
        # Text sizes for each of the text bits
        with open('./doc/sizes.json') as f:
            data = json.load(f)
            sizes = data[self._attributes['Font']]

        # Casing for each of the font types
        # Can either be full smcp (True), or changing case: with name on smcp, position and description capitalized,
        # and project and location on fullcaps (False)
        casing = {
            'Dorsian Sea': False,
            'Port Carruthers': False,
            'Silian Rail': True,
            'Romalian Type': False,
            'Pale Nimbus': False,
            'Esoteric Antiqua': False,
            'Century Block': True,
            'Bookman Type': True,
            'Babylon Script': True,
            'Royal Script': True
        }

        # Getting path for the font to use, gets loaded again every time as there is a need for a changing size
        fontpath = './assets/Font/{}.otf'.format(self._attributes['Font'])
        # Getting size of the image
        imgsize = self.card.size

        # Lettering color is achieved in two steps:
        # first, the lettering is carved out, and then the image laid over the corresponding texture
        fill = '#00000000'
        if self._attributes['Special lettering'] == 'Gold lettering':
            stroke_fill = '#ebb165AA'  # Filling is made with a transitional color
        if self._attributes['Special lettering'] == 'Silver lettering':
            stroke_fill = '#C0C0C0AA'
        else:
            stroke_fill = '#686767AA'

        # Procedurally adding blocks of text
        #
        # : change casing for different blocks of text? small caps, all caps, regular case, depending on the font and the block of text being written, more variability
        def _add_text(font_size, text, coordinates, features):
            """Adds the defined block of text to the image

            Parameters:
                font_size: int, font size to use
                text: string, text to add to the image
                coordinates: (float, float), placement of the center of the text block
            """
            # Defining base parameters
            font = ImageFont.truetype(fontpath, font_size)
            card_draw = ImageDraw.Draw(self.card)
            size = np.array(card_draw.textsize(text, font=font, features=features, stroke_width=1))
            # Creating a piece of canvas to draw text on and blur
            blurred = Image.new('RGBA', imgsize)
            draw = ImageDraw.Draw(blurred)
            draw.text(coordinates - size / 2 + np.array((0.5, -0.5)), text, fill=fill, stroke_width=1,
                      stroke_fill=stroke_fill, font=font, features=features)
            blurred = blurred.filter(ImageFilter.BoxBlur(0.25))
            # Pasting this soft text into the background
            self.card.paste(blurred, (0, 0), blurred)
            # Finally, drawing on the sharp text
            card_draw.text(coordinates - size / 2, text, fill=fill, stroke_width=1,
                           stroke_fill=stroke_fill, font=font, features=features)

        # Each of the block texts have different casings, depending on the font that got rolled
        if casing[self._attributes['Font']] == True:
            # All text to be on small capitals
            features = ['smcp', '-liga']  # REMOVE LIGATURES WITH '-liga'
            project_name = "Dorsia Club"
            project_description = "NFT Business Cards"
            position = self.position
            location = self.locationdict[self._attributes['Location']]
        else:
            # Name to be on small capitals, project name and location full caps, position and project description capitalized
            features = ['-liga']
            project_name = "Dorsia Club".upper()
            project_description = "NFT Business Cards"
            position = self.position
            location = self.locationdict[self._attributes['Location']].upper()

        # Adding phone number, casing does not alter it
        phone_number = '212 555 {}'.format("%0.4d" % self._attributes['Phone number'])
        _add_text(sizes['phone'], phone_number, coordinates['phone'], [])

        # Project name and description have a dynamic text position approach to ensure card symmetry
        # The x position results of solving the following equation for pos:
        # coordinates['phone'][0] - size(phone)/2 = 2574 - (pos + size(project)/2)
        # Getting the phone text size
        font = ImageFont.truetype(fontpath, sizes['phone'])
        card_draw = ImageDraw.Draw(self.card)
        size_phone = np.array(card_draw.textsize(phone_number, font=font, features=features, stroke_width=1))[0]
        # Getting the project name text size
        font = ImageFont.truetype(fontpath, sizes['project'])
        size_project = np.array(card_draw.textsize(project_name, font=font, features=features, stroke_width=1))[0]
        # Solving the symmetry equation and adding it to the existing data
        pos = 2574 + size_phone / 2 - size_project / 2 - coordinates['phone'][0]
        coordinates['project'][0] = pos
        coordinates['description'][0] = pos

        # Adding project name
        _add_text(sizes['project'], project_name, coordinates['project'], features)
        # Adding project description
        _add_text(sizes['description'], project_description, coordinates['description'], features)

        # Adding name, always has smcp casing -- also preventing ligatures
        _add_text(sizes['name'], self.name, coordinates['name'], ['smcp', '-liga'])
        # Adding position
        _add_text(sizes['position'], position, coordinates['position'], features)
        # Adding location
        _add_text(sizes['location'], location, coordinates['location'], features)

        # Achieving some nice texture for the fonts -- first saving the resulting image to then lay over gold texture
        temp = self.card
        if self._attributes['Special lettering'] == 'Gold lettering':
            # Opening gold texture and laying this image over it
            self.card = Image.open('./assets/Special/Gold texture.png')
            self.card.paste(temp, (0, 0), temp)
        elif self._attributes['Special lettering'] == 'Silver lettering':
            # Opening silver texture and laying this image over it
            self.card = Image.open('./assets/Special/Silver texture.png')
            self.card.paste(temp, (0, 0), temp)
        else:
            # Opening black texture and laying this image over it
            self.card = Image.open('./assets/Special/Black texture.png')
            self.card.paste(temp, (0, 0), temp)

    def _add_watermark(self):
        """Adds the watermark to the underlying Business Card, specifically supported for all kinds of paper"""
        wmark = Image.open('./assets/Special/Watermark/{}.png'.format(self._attributes['Paper'])).convert('RGBA')
        # self.card.paste(wmark, (0, 0), wmark)
        self.card = self.card.convert('RGBA')
        self.card = Image.alpha_composite(self.card, wmark)

    def _generate_extras(self):
        """Adds the necessary extra parameters to the NFT Business Card

        These go, in order: footprint, pen defaced, cranberry juice, (watermark), menacing shadow, focusing shadow
        """
        self.card = self.card.convert('RGBA')

        # Golden edges
        if self._attributes['Gold edges']:
            gedges = Image.open('./assets/Special/Gold edges.png').convert('RGBA')
            self.card = Image.alpha_composite(self.card, gedges)

        # Washed card
        if self._attributes['Washed']:
            paper_type = self._attributes['Paper']
            if paper_type == 'Unpresentable':
                washed_type = 'Washed Unpresentable'
            elif paper_type == 'Recycled Note':
                washed_type = 'Washed Recycled'
            else:
                washed_type = 'Washed'
            washed = Image.open('./assets/Special/{}.png'.format(washed_type)).convert('RGBA')
            self.card = Image.alpha_composite(self.card, washed)

        # Cranberry juice
        if self._attributes['Cranberry juice']:
            cjuice = Image.open('./assets/Special/Cranberry juice.png').convert('RGBA')
            self.card = Image.alpha_composite(self.card, cjuice)

        # Footprint -- changes depending on paper
        if self._attributes['Footprint']:
            paper_type = self._attributes['Paper']
            if paper_type == 'Unpresentable':
                fprint_type = 'Footprint Unpresentable'
            elif paper_type == 'Recycled Note':
                fprint_type = 'Footprint Recycled'
            else:
                fprint_type = 'Footprint'
            fprint = Image.open('./assets/Special/{}.png'.format(fprint_type)).convert('RGBA')
            self.card = Image.alpha_composite(self.card, fprint)

        # Defaced with pen
        if self._attributes['Defaced']:
            defaced = Image.open('./assets/Special/Defaced.png').convert('RGBA')
            self.card = Image.alpha_composite(self.card, defaced)

        # Shadow type - Menacing or Focused
        if self._attributes['Shadow']:
            shadow = Image.open('./assets/Special/{}.png'.format(self._attributes['Shadow'])).convert('RGBA')
            self.card = Image.alpha_composite(self.card, shadow)

        # Gold and silver lettering -- already done when managing fonts!
        # NFT image is now DONE! all its left is to upload it

    def _save_image(self, filename):
        """Saves the image file locally

        Parameters:
            filename: string, name to give the image file -- intended for using genes as the filename
        Returns:
            path: string, path for the saved file
        """
        # path = './save/{}.png'.format(filename)
        # self.card.save(path, 'PNG')

        path = './save/{}.jpg'.format(filename)
        rgb_im = self.card.convert('RGB')
        rgb_im.save(path, quality=95)
        return path

    def _save_thumbnail(self, filename):
        """Saves the thumbnail file locally

        Parameters
            filename: string, name to give the image file -- intended for using 'THUMB_' + genes as the filename
        Returns:
            path: string, path for the saved file
        """
        size = 644, 462
        path = './save/{}.jpg'.format(filename)
        rgb_im = self.card.convert('RGB')
        rgb_im.thumbnail(size, Image.ANTIALIAS)
        rgb_im.save(path, optimize=True, quality=80)
        return path

    def _upload_image(self, image_path):
        """Uploads the generated image to IPFS, and deletes it once it has been pinned

        Parameters:
            image_path: string, path where the thumbnail image is located
        Returns:
            path: string, IPFS filepath of the uploaded image
        """
        ipfs_hash = self.pinata.pin_file_to_ipfs(image_path)['IpfsHash']
        image_url = self.ipfs_gateway + ipfs_hash
        return image_url

    def _upload_thumbnail(self, thumbnail_path):
        """Uploads the generated image to IPFS

        Parameters:
            thumbnail_path: string, path where the thumbnail image is located
        Returns:
            path: string, IPFS filepath of the uploaded thumbnail
        """
        ipfs_hash = self.pinata.pin_file_to_ipfs(thumbnail_path)['IpfsHash']
        image_url = self.ipfs_gateway + ipfs_hash
        return image_url

    def _generate_metadata(self, image_url, thumbnail_url):
        """Generates the JSON file that gets uploaded to IPFS to be presented as the tokenURI

        Returns:
            metadata: JSON file path, complying with the metadata standard
        """

        # External URL: corresponding page for the card inside dorsiaclub.biz
        # Token metadata followed adheres to the standard set by OpenSea:
        """
        {
            "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.",
            "external_url": "https://openseacreatures.io/3",
            "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png",
            "name": "Dave Starbelly",
            "attributes": [...],
        }

        The name and description fields are different for every token would be shown in the marketplace, and thus, in 
        a way, follow a similar structure to the name - position structure defined for the Business Card
        """
        #
        metadata = {
            "id": self.tokenId,
            "name": "Dorsia Club",
            "description": "Because every self-respected businessman needs a business card.",
            "card_name": self.name,
            "card_position": self.position,
            "card_properties": self.properties,
            "external_url": "https://dorsiaclub-testnet.netlify.app/card/{}".format(self.tokenId),
            "image": image_url,
            "thumbnail": thumbnail_url,
            "attributes": self.attributes  # TODO: check standard for having SPECIAL ATTRIBUTES added to metadata
        }

        return metadata

    def _upload_metadata(self, metadata):
        """Uploads the generated metadata to IPFS

        Parameters:
            metadata: JSON
        Returns:
            tokenURI: string, IPFS filepath of the updated token URI
        """

        ipfs_hash = self.pinata.pin_json_to_ipfs(metadata)
        return ipfs_hash

    def get_tokenURI_hash(self):
        """Generates the required tokenURI, first creating the card, then uploading it, and then uploading the metadata

        Returns:
            hash: string, IPFS hash of the generated metadata JSON
            path: string, location of the image file stored on disk
        """
        self._generate_base()
        if self._attributes['Watermark']:
            self._add_watermark()
        self._generate_text()
        self._generate_extras()
        image_path = self._save_image(self.genes)  # Temporal name, gets deleted afterwards by the oracle
        thumbnail_path = self._save_thumbnail('thumb_' + self.genes)
        _image_url = self._upload_image(image_path)
        _thumbnail_url = self._upload_thumbnail(thumbnail_path)
        _metadata = self._generate_metadata(_image_url, _thumbnail_url)  # add thumnail to metadata

        return self._upload_metadata(_metadata)['IpfsHash'], image_path, thumbnail_path


if __name__ == '__main__':
    # TESTING
    import random

    seed = "%0.30d" % random.randint(0, 999999999999999999999999999999)
    # Setting a specific value
    """seed = seed[:6] + '75' + seed[8:]
    print(seed)"""

    """'Coloring': {
        33: 'Glacier',  # 0
        66: 'Bone',  # 20
        70: 'Ivory',
        98: 'Eggshell',  # 40
        99: 'White'
    },"""

    """# GETTING THE DEFAULTURI - filler code
    # TODO: Get a proper defaultURI
    newcardwhatdoyouthink = Card(1, '', '', seed)
    newcardwhatdoyouthink._generate_base()
    path = newcardwhatdoyouthink._save_image('DEFAULTURI')  # Temporal name, gets deleted afterwards by the oracle
    _url = newcardwhatdoyouthink._upload_image(path)
    _metadata = newcardwhatdoyouthink._generate_metadata(_url)
    print(newcardwhatdoyouthink._upload_metadata(_metadata)['IpfsHash'])"""

    # seed = '244459387160448912949407232908'

    """print(seed, len(seed))
    newcardwhatdoyouthink = Card(1, 'Patrick Dorsia BATEMAN', 'Vice President, Murders and Exec', seed)
    newcardwhatdoyouthink._attributes = {'Setting': 'Connemara Marble', 'Paper': 'Rail Stamped', 'Coloring': 'White', 'Font': 'Royal Script', 'Location': 'Mergers and Acquisitions', 'Cranberry juice': None, 'Shadow': 'Focused shadow', 'Watermark': True, 'Footprint': None, 'Defaced': None, 'Special lettering': None, 'Gold edges': True, 'Washed': False, 'Phone number': 1488}
    print(newcardwhatdoyouthink._attributes)
    newcardwhatdoyouthink._generate_base()
    if newcardwhatdoyouthink._attributes['Watermark']:
        newcardwhatdoyouthink._add_watermark()
    newcardwhatdoyouthink._generate_text()
    newcardwhatdoyouthink._generate_extras()
    path = newcardwhatdoyouthink._save_image(seed)"""

    # Generating one equal card for each font
    """attributes = {'Setting': 'Connemara Marble', 'Paper': 'Rail Stamped', 'Coloring': 'White', 'Font': 'Royal Script',
                  'Location': 'Mergers and Acquisitions', 'Cranberry juice': None, 'Shadow': 'Focused shadow',
                  'Watermark': True, 'Footprint': None, 'Defaced': None, 'Special lettering': 'Silver lettering',
                  'Gold edges': True, 'Washed': False, 'Phone number': 1488}
    fonts = ['Dorsian Sea', 'Port Carruthers', 'Silian Rail', 'Romalian Type', 'Pale Nimbus', 'Esoteric Antiqua',
             'Century Block', 'Bookman Type', 'Babylon Script', 'Royal Script']"""

    """for font in fonts:
        newcardwhatdoyouthink = Card(1, 'Patrick BATEMAN', 'Vice President', seed)
        attributes['Font'] = font
        newcardwhatdoyouthink._attributes = attributes
        newcardwhatdoyouthink._generate_base()
        if newcardwhatdoyouthink._attributes['Watermark']:
            newcardwhatdoyouthink._add_watermark()
        newcardwhatdoyouthink._generate_text()
        newcardwhatdoyouthink._generate_extras()

        path = newcardwhatdoyouthink._save_image(font)"""

    """print(seed)
    a = time.time()
    newcardwhatdoyouthink = Card(1, '', '', seed)
    #newcardwhatdoyouthink = Card(1, '', '', seed)
    print(newcardwhatdoyouthink._attributes)
    print(newcardwhatdoyouthink.attributes)
    hash = newcardwhatdoyouthink.get_tokenURI_hash()
    print(hash)
    print(time.time() - a)"""

    """for i in range(250):
        print(i)
        seed = "%0.30d" % random.randint(0, 999999999999999999999999999999)
        newcardwhatdoyouthink = Card(1, 'Patrick BATEMAN', 'Vice President', seed)

        newcardwhatdoyouthink._generate_base()
        if newcardwhatdoyouthink._attributes['Watermark']:
            newcardwhatdoyouthink._add_watermark()
        newcardwhatdoyouthink._generate_text()
        newcardwhatdoyouthink._generate_extras()
        path = newcardwhatdoyouthink._save_image(str(i))"""

    # Generating assets for landing page
    """names_positions = [
        ['Satoshi NAKAMOTO', 'CEO of Bitcoin'],
        ['El Dip', 'CEO of Dorsia Club'],
        ['Nayib BUKELE', 'El Presidente'],
        ['Peter SCHIFF', 'CEO of Gold'],
        ['Michael SAYLOR', 'Micro Tragedy'],
        ['Vitalik BUTERIN', 'Money Skelly'],
        ['Elon MUSK', 'Meme Lord'],
        ['Craig WRIGHT', 'Satoshi Nakamoto'],
        ['Patrick BATEMAN', 'Vice President'],
        ['CZ', 'CEO of Binance'],
        ['Paul ALLEN', 'Vice President']
    ]

    attributes = {'Setting': 'Kashmir Silk', 'Paper': 'Imperial Print', 'Coloring': 'White', 'Font': 'Century Block',
                  'Location': 'Mergers and Acquisitions', 'Cranberry juice': None, 'Shadow': None, 'Watermark': True,
                  'Footprint': None, 'Defaced': None, 'Special lettering': None, 'Gold edges': None, 'Washed': False,
                  'Phone number': 6342}
    seed = "%0.30d" % random.randint(0, 999999999999999999999999999999)
    newcardwhatdoyouthink = Card(1, 'Paul ALLEN', 'Vice President', seed)
    newcardwhatdoyouthink._attributes = attributes
    newcardwhatdoyouthink._generate_base()
    if newcardwhatdoyouthink._attributes['Watermark']:
        newcardwhatdoyouthink._add_watermark()
    newcardwhatdoyouthink._generate_text()
    newcardwhatdoyouthink._generate_extras()
    path = newcardwhatdoyouthink._save_image('card')

    attributes = {'Setting': 'Resin River', 'Paper': 'Mountain Craft', 'Coloring': 'Bone', 'Font': 'Royal Script',
                  'Location': 'Mergers and Acquisitions', 'Cranberry juice': None, 'Shadow': 'Menacing shadow',
                  'Watermark': True, 'Footprint': None, 'Defaced': None, 'Special lettering': 'Gold lettering',
                  'Gold edges': None, 'Washed': False, 'Phone number': 1111}

    i = 0
    for pair in names_positions:
        seed = "%0.30d" % random.randint(0, 999999999999999999999999999999)
        newcardwhatdoyouthink = Card(1, pair[0], pair[1], seed)
        newcardwhatdoyouthink._attributes = attributes
        newcardwhatdoyouthink._generate_base()
        if newcardwhatdoyouthink._attributes['Watermark']:
            newcardwhatdoyouthink._add_watermark()
        newcardwhatdoyouthink._generate_text()
        newcardwhatdoyouthink._generate_extras()
        path = newcardwhatdoyouthink._save_image(str(i))
        i += 1"""
    seed = '244459387160448912949407232908'
    camelCase_properties = {
        "position": 'Vice President',
        "twitterAccount": 'twitterAccount',
        'telegramAccount': 'telegramAccount',
        'telegramGroup':  'telegramGroup',
        'discordAccount': '123456789012345678',
        'discordGroup': 'discordGroup',
        'githubUsername': 'githubUsername',
        'userWebsite.com': 'userWebsite.com'
    }
    properties = {'position': 'Vice President', 'twitter_account': 'twitterAccount', 'telegram_account': 'telegramAccount', 'telegram_group': 'telegramGroup', 'discord_account': '123456789012345678', 'discord_group': 'discordGroup', 'github_username': 'githubUsername', 'user_website.com': 'userWebsite.com'}
    properties = {'twitter_account': '', 'telegram_account': '', 'telegram_group': '', 'discord_account': 0, 'discord_group': '', 'github_username': '', 'user_website.com': ''}
    newcardwhatdoyouthink = Card(1, 'Patrick Bateman', 'Vice President', seed, properties)
    tokenURI, image_path, thumbnail_path = newcardwhatdoyouthink.get_tokenURI_hash()
    print(tokenURI)
